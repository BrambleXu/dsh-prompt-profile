/** Markdown prompt-profile discovery and validation. */
/** Validated prompt profile. */
export interface PromptProfile {
    name: string;
    description: string;
    provider?: string;
    model?: string;
    reasoningEffort?: string;
    restore: boolean;
    body: string;
    path: string;
    source: 'user' | 'project';
}
/** Expand a leading home marker in configuration. */
export declare function expandHome(path: string): string;
/** Parse one Markdown profile and validate its supported frontmatter. */
export declare function parseProfile(path: string, name: string, source: 'user' | 'project', markdown: string): PromptProfile;
/** Load user profiles, then overlay project profiles with the same name. */
export declare function loadProfiles(cwd: string, userDirectory: string, projectDirectory: string): Promise<Map<string, PromptProfile>>;
/** Render a stable human-readable profile inventory. */
export declare function renderProfileList(profiles: ReadonlyMap<string, PromptProfile>): string;
