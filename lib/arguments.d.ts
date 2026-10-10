/** Prompt-profile command argument parsing and template substitution. */
/** Split command input without invoking a shell. */
export declare function splitArguments(input: string): string[];
/** Substitute Pi-compatible positional placeholders in a prompt body. */
export declare function substituteArguments(template: string, args: readonly string[]): string;
