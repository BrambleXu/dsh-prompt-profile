/** Markdown prompt-profile discovery and validation. */
import { readdir, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';
/** Expand a leading home marker in configuration. */
export function expandHome(path) {
    if (path === '~')
        return homedir();
    if (path.startsWith('~/'))
        return join(homedir(), path.slice(2));
    return path;
}
/** Parse one Markdown profile and validate its supported frontmatter. */
export function parseProfile(path, name, source, markdown) {
    const normalized = markdown.replace(/\r\n/gu, '\n');
    if (!normalized.startsWith('---\n'))
        throw new Error(`${path}: prompt profile must start with YAML frontmatter`);
    const end = normalized.indexOf('\n---\n', 4);
    if (end === -1)
        throw new Error(`${path}: prompt profile frontmatter is not closed`);
    const frontmatter = parse(normalized.slice(4, end));
    if (typeof frontmatter !== 'object' || frontmatter === null || Array.isArray(frontmatter)) {
        throw new Error(`${path}: prompt profile frontmatter must be an object`);
    }
    const record = frontmatter;
    const description = optionalString(record.description, 'description', path) ?? '';
    const provider = optionalString(record.provider, 'provider', path);
    const model = optionalString(record.model, 'model', path);
    const reasoningEffort = optionalString(record.reasoningEffort, 'reasoningEffort', path);
    const restore = optionalBoolean(record.restore, 'restore', path) ?? true;
    if ((provider === undefined) !== (model === undefined)) {
        throw new Error(`${path}: provider and model must be specified together`);
    }
    if (reasoningEffort !== undefined && provider === undefined) {
        throw new Error(`${path}: reasoningEffort requires provider and model`);
    }
    const body = normalized.slice(end + 5).trim();
    if (body.length === 0)
        throw new Error(`${path}: prompt profile body must not be empty`);
    return {
        name,
        description,
        ...(provider === undefined ? {} : { provider }),
        ...(model === undefined ? {} : { model }),
        ...(reasoningEffort === undefined ? {} : { reasoningEffort }),
        restore,
        body,
        path,
        source,
    };
}
function optionalString(value, field, path) {
    if (value === undefined)
        return undefined;
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${path}: ${field} must be a non-empty string`);
    }
    return value.trim();
}
function optionalBoolean(value, field, path) {
    if (value === undefined)
        return undefined;
    if (typeof value !== 'boolean')
        throw new Error(`${path}: ${field} must be a boolean`);
    return value;
}
/** Load user profiles, then overlay project profiles with the same name. */
export async function loadProfiles(cwd, userDirectory, projectDirectory) {
    const profiles = new Map();
    const sources = [
        { path: resolve(expandHome(userDirectory)), source: 'user' },
        { path: resolve(cwd, projectDirectory), source: 'project' },
    ];
    for (const item of sources) {
        for (const file of await markdownFiles(item.path)) {
            const name = relative(item.path, file).slice(0, -extname(file).length).split('\\').join('/');
            profiles.set(name, parseProfile(file, name, item.source, await readFile(file, 'utf8')));
        }
    }
    return profiles;
}
async function markdownFiles(directory) {
    const result = [];
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return result;
        throw error;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory())
            result.push(...await markdownFiles(path));
        else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md' && basename(entry.name) !== 'README.md')
            result.push(path);
    }
    return result;
}
/** Render a stable human-readable profile inventory. */
export function renderProfileList(profiles) {
    if (profiles.size === 0)
        return 'No prompt profiles found.';
    return [...profiles.values()]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(profile => `${profile.name}${profile.description === '' ? '' : ` — ${profile.description}`} [${profile.source}]`)
        .join('\n');
}
//# sourceMappingURL=profiles.js.map