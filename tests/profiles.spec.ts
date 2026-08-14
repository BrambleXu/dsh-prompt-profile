import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadProfiles, parseProfile, renderProfileList } from '../src/profiles.js'

const temporary: string[] = []
afterEach(async () => Promise.all(temporary.splice(0).map(path => rm(path, { recursive: true, force: true }))))

describe('prompt profiles', () => {
  it('parses supported frontmatter', () => {
    const profile = parseProfile('/p/review.md', 'review', 'project', [
      '---',
      'description: Review a file',
      'provider: deepseek',
      'model: deepseek-chat',
      'reasoningEffort: high',
      'restore: false',
      '---',
      'Review $1.',
    ].join('\n'))
    expect(profile).toMatchObject({ name: 'review', provider: 'deepseek', model: 'deepseek-chat', restore: false })
  })

  it('requires provider and model together', () => {
    expect(() => parseProfile('/p/bad.md', 'bad', 'project', '---\nmodel: x\n---\nDo it.'))
      .toThrow('specified together')
    expect(() => parseProfile('/p/bad.md', 'bad', 'project', '---\nreasoningEffort: high\n---\nDo it.'))
      .toThrow('requires provider and model')
  })

  it('gives project profiles precedence over user profiles', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-prompt-profile-'))
    temporary.push(root)
    const user = join(root, 'user')
    const project = join(root, 'repo')
    await mkdir(user, { recursive: true })
    await mkdir(join(project, '.profiles'), { recursive: true })
    await writeFile(join(user, 'review.md'), '---\ndescription: user\n---\nUser')
    await writeFile(join(project, '.profiles', 'review.md'), '---\ndescription: project\n---\nProject')

    const profiles = await loadProfiles(project, user, '.profiles')
    expect(profiles.get('review')?.source).toBe('project')
    expect(renderProfileList(profiles)).toContain('review — project [project]')
  })
})
