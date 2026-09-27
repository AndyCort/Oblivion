export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isUnique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

export function validatePublish(body: unknown): body is {
  articles: Array<Record<string, unknown> & { id: string }>;
  activeIds?: string[];
} {
  if (!isRecord(body) || !Array.isArray(body.articles)) return false;
  if (!body.articles.every((a) => isRecord(a) && isNonEmptyString(a.id))) return false;
  const ids = body.articles.map((a) => a.id as string);
  if (!isUnique(ids)) return false;
  const activeIds = body.activeIds;
  if (activeIds !== undefined && (!isStringList(activeIds) ||
      !ids.every((id) => activeIds.includes(id)))) return false;
  return true;
}

export function validatePublishRaw(body: unknown): body is {
  files: Array<{ path: string; content: string }>;
  deletedPaths?: string[];
  fullSync?: boolean;
} {
  if (!isRecord(body) || !Array.isArray(body.files)) return false;
  if (body.fullSync !== undefined && typeof body.fullSync !== 'boolean') return false;
  if (body.deletedPaths !== undefined && !isStringList(body.deletedPaths)) return false;
  if (!body.files.every((f) => isRecord(f) && isNonEmptyString(f.path) &&
      f.path.endsWith('.md') && typeof f.content === 'string')) return false;
  const paths = body.files.map((f) => f.path as string);
  const deletedPaths = body.deletedPaths;
  return isUnique(paths) && !paths.some((path) =>
    Array.isArray(deletedPaths) && deletedPaths.includes(path));
}
