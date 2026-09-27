import test from 'node:test';
import assert from 'node:assert/strict';
import { typescriptUrl, moduleUrl } from './load-typescript.mjs';

const validationUrl = await typescriptUrl('../workers/content/src/validation.ts');
const { validatePublish, validatePublishRaw } = await import(validationUrl);
const { default: worker } = await import(await typescriptUrl('../workers/content/src/index.ts', {
  './validation': validationUrl,
  yaml: import.meta.resolve('yaml'),
  'cloudflare:workers': moduleUrl('export const cache = { purge: async () => ({ success: true }) };'),
}));

for (const body of [null, [], {}, { articles: [null] }, { articles: [{ id: '' }] },
  { articles: [{ id: 'a' }, { id: 'a' }] }, { articles: [{ id: 'a' }], activeIds: [] }]) {
  test(`invalid structured publication is rejected: ${JSON.stringify(body)}`, async () => {
    assert.equal(validatePublish(body), false);
    const response = await worker.fetch(new Request('https://example.test/api/publish', {
      method: 'POST', headers: { 'x-publish-secret': 'test' }, body: JSON.stringify(body),
    }), { PUBLISH_SECRET: 'test', DB: { prepare() { assert.fail('Invalid data must never reach the database'); } } });
    assert.equal(response.status, 400);
  });
}

test('raw publishing rejects invalid files, duplicate paths and conflicting deletions', async () => {
  const file = { path: 'hello.md', content: '# Hello' };
  for (const body of [null, {}, { files: [null] }, { files: [{ path: 'image.png', content: '' }] },
    { files: [file, file] }, { files: [file], fullSync: 'false' },
    { files: [file], deletedPaths: ['hello.md'] }]) {
    assert.equal(validatePublishRaw(body), false);
    const response = await worker.fetch(new Request('https://example.test/api/publish-raw', {
      method: 'POST', headers: { 'x-publish-secret': 'test' }, body: JSON.stringify(body),
    }), { PUBLISH_SECRET: 'test', DB: { prepare() { assert.fail('Unexpected database mutation'); } } });
    assert.equal(response.status, 400);
  }
});

test('publication accepts valid full and incremental payloads', () => {
  assert.equal(validatePublish({ articles: [{ id: 'a' }], activeIds: ['a', 'b'] }), true);
  assert.equal(validatePublishRaw({ files: [{ path: '文章.md', content: '' }], fullSync: false }), true);
  assert.equal(validatePublishRaw({ files: [], deletedPaths: ['removed.md'], fullSync: false }), true);
});

test('empty raw publication is a no-op', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/publish-raw', {
    method: 'POST', headers: { 'x-publish-secret': 'test' }, body: '{"files":[]}',
  }), { PUBLISH_SECRET: 'test' });
  assert.deepEqual(await response.json(), { ok: true, published: 0, deleted: 0 });
});

test('publication still requires authorization', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/publish', {
    method: 'POST', body: '{"articles":[]}',
  }), { PUBLISH_SECRET: 'test' });
  assert.equal(response.status, 403);
});

const remoteMock = moduleUrl(`
  export const CONTENT_API_ENABLED = true;
  export async function getRemoteArticles(signal) {
    if (signal?.aborted) throw new Error('aborted');
    return [];
  }
  export async function getRemoteArticle(id) { return { id, title: id, date: '' }; }
`);
const articles = await import(await typescriptUrl('../src/api/articles.ts', { './mdArticles': remoteMock }));

test('empty remote article lists stay empty', async () => {
  assert.deepEqual(await articles.fetchArticles(), []);
});
test('article IDs with percent characters are not decoded twice', async () => {
  assert.equal((await articles.fetchArticle('100%')).id, '100%');
  assert.equal((await articles.fetchArticle('%2F')).id, '%2F');
});
test('cancelled article requests do not fall back to mock articles', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(articles.fetchArticles(controller.signal), /aborted/);
});

test('blocked browser storage retains preferences in memory', async () => {
  const { readStorage, writeStorage } = await import(await typescriptUrl('../src/utils/storage.ts'));
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Blocked'); } });
  try {
    assert.equal(readStorage('theme'), null);
    writeStorage('theme', 'dark');
    assert.equal(readStorage('theme'), 'dark');
    writeStorage('theme', 'light');
    assert.equal(readStorage('theme'), 'light');
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('valid raw publication preserves IDs, parses metadata and retains non-language comments', async () => {
  const writes = [];
  const DB = {
    prepare(sql) {
      return {
        async run() { return { meta: { changes: 0 } }; },
        async all() {
          return { results: sql.includes('source_path IS NOT NULL')
            ? [{ id: 'stable-id', source_path: 'hello.md' }] : [{ id: 'stable-id' }] };
        },
        bind(...values) { return { values }; },
      };
    },
    async batch(statements) {
      writes.push(...statements.map((statement) => statement.values));
      return statements.map(() => ({ meta: { changes: 1 } }));
    },
  };
  const content = '---\ntitle: Hello\n---\n<!-- note -->Body stays here<!-- /note -->';
  const response = await worker.fetch(new Request('https://example.test/api/publish-raw', {
    method: 'POST', headers: { 'x-publish-secret': 'test' },
    body: JSON.stringify({ files: [{ path: 'hello.md', content }] }),
  }), { PUBLISH_SECRET: 'test', DB });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, published: 1, deleted: 0 });
  assert.equal(writes[0][0], 'stable-id');
  assert.equal(writes[0][2], 'Hello');
  assert.equal(writes[0][9], '<!-- note -->Body stays here<!-- /note -->');
});

test('public article responses never expose internal source paths', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/articles'), {
    DB: { prepare() { return { async all() { return { results: [{ id: 'a', source_path: 'private/note.md', title: '{"zh":"标题"}', pinned: 1 }] }; } }; } },
  });
  const { articles } = await response.json();
  assert.equal(articles[0].source_path, undefined);
  assert.deepEqual(articles[0].title, { zh: '标题' });
  assert.equal(articles[0].pinned, true);
});
