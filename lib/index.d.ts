/** Reusable Markdown prompt profiles for DeepSeek Harness. */
import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
export declare const name = "dsh-prompt-profile";
export declare const inject: string[];
/** Profile discovery locations. */
export interface Config {
    userDirectory: string;
    projectDirectory: string;
}
export declare const Config: Schema<Config>;
/** Register `/prompt-profile` and scoped per-agent model selection. */
export declare function apply(ctx: Context, config: Config): void;
