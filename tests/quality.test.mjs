import test from 'node:test';
import assert from 'node:assert/strict';
import { typescriptUrl, moduleUrl } from './load-typescript.mjs';

const validationUrl = await typescriptUrl('../workers/content/src/validation.ts');
const { validatePublish, validatePublishRaw } = await import(validationUrl);
const momentsUrl = await typescriptUrl('../workers/content/src/moments.ts', { './validation': validationUrl });
const { rowToMoment } = await import(momentsUrl);
const { default: worker } = await import(await typescriptUrl('../workers/content/src/index.ts', {
  './validation': validationUrl,
  './moments': momentsUrl,
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


test('D1 moments normalize timestamps, media, music and tags without exposing internal columns', () => {
  const time = Date.UTC(2026, 9, 17, 0, 30);
  const moment = rowToMoment({
    time, content: '第一行\n第二行', location: 'Elysium',
    tags: '["日常", null, 2]',
    media: JSON.stringify([
      { type: 'img', url: 'https://example.com/photo.jpg' },
      { type: 'vid', url: 'https://example.com/video.mp4' },
      { type: 'img', url: 'javascript:alert(1)' },
      { type: 'other', url: 'https://example.com/unknown' },
    ]),
    music: '{"title":"Song","artist":"Artist","url":"https://example.com/song"}',
    created_at: time, updated_at: time,
  });
  assert.equal(moment.id, `moment-${time}`);
  assert.equal(moment.date, '2026-10-17 08:30');
  assert.equal(moment.content, '第一行\n第二行');
  assert.deepEqual(moment.tags, ['日常']);
  assert.deepEqual(moment.media.map((item) => item.type), ['image', 'video']);
  assert.equal(moment.music.title, 'Song');
  assert.equal(moment.likes, 0);
  assert.equal(moment.created_at, undefined);
  assert.equal(moment.updated_at, undefined);
  assert.equal(rowToMoment({ time: time / 1000 }).date, moment.date);
});

test('malformed optional moment metadata remains safe to display', () => {
  const moment = rowToMoment({ time: 0, tags: 'broken', media: '{}', music: '{"url":"data:text/html,test"}' });
  assert.equal(moment.date, '1970-01-01 08:00');
  assert.deepEqual(moment.tags, []);
  assert.deepEqual(moment.media, []);
  assert.equal(moment.music, null);
  assert.throws(() => rowToMoment({ time: 'not-a-timestamp' }));
});

test('moments endpoint queries only the separate moments database and keeps empty results empty', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/moments'), {
    DB: { prepare() { assert.fail('Moments must never query the article database'); } },
    MOMENTS_DB: { prepare(sql) {
      assert.match(sql, /^SELECT time, content, media, tags, location, music FROM articles ORDER BY time DESC$/);
      return { async all() { return { results: [] }; } };
    } },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  assert.deepEqual(await response.json(), { moments: [] });
});

test('moments endpoint returns normalized database records', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/moments'), {
    MOMENTS_DB: { prepare() { return { async all() { return { results: [
      { time: 0, content: '真实动态', tags: '["日常"]', media: '[]' },
    ] }; } }; } },
  });
  const body = await response.json();
  assert.equal(body.moments[0].content, '真实动态');
  assert.deepEqual(body.moments[0].tags, ['日常']);
});

test('moment client preserves empty results, reports failures and forwards cancellation', async () => {
  const api = await import(await typescriptUrl('../src/api/moments.ts', {
    './mdArticles': moduleUrl('export const CONTENT_API_BASE = "https://example.test";'),
  }));
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://example.test/api/moments');
      assert.equal(options.signal, controller.signal);
      return Response.json({ moments: [] });
    };
    assert.deepEqual(await api.fetchMoments(controller.signal), []);
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(api.fetchMoments(), /503/);
    globalThis.fetch = async () => Response.json({ articles: [] });
    await assert.rejects(api.fetchMoments(), /Invalid moments response/);
    globalThis.fetch = async () => { throw new Error('aborted'); };
    await assert.rejects(api.fetchMoments(controller.signal), /aborted/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
