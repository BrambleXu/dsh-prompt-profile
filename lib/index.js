/** Reusable Markdown prompt profiles for DeepSeek Harness. */
import { installModelSelection } from '@deepseek-ai/dsh-agent';
import { createUserMessage, ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import Schema from '@deepseek-ai/schemastery';
import { splitArguments, substituteArguments } from './arguments.js';
import { loadProfiles, renderProfileList } from './profiles.js';
export const name = 'dsh-prompt-profile';
export const inject = ['commands'];
export const Config = Schema.object({
    userDirectory: Schema.string().default('~/.dsh/prompt-profiles'),
    projectDirectory: Schema.string().default('.dsh/prompt-profiles'),
});
/** Register `/prompt-profile` and scoped per-agent model selection. */
export function apply(ctx, config) {
    const selections = new Map();
    ctx.on('agent/disposed', ({ agent }) => {
        selections.delete(agent);
    });
    ctx.effect(() => () => {
        for (const state of selections.values())
            state.dispose();
        selections.clear();
    }, 'dsh-prompt-profile.selections');
    ctx.commands.register({
        name: 'prompt-profile',
        description: 'List or run a reusable Markdown prompt profile.',
        input: { hint: '<name|list> [arguments]' },
        async handler({ agent, rawInput }) {
            try {
                const cwd = agent.session.header.cwd ?? process.cwd();
                const profiles = await loadProfiles(cwd, config.userDirectory, config.projectDirectory);
                const [profileName, ...args] = splitArguments(rawInput);
                if (profileName === undefined || profileName === 'list') {
                    return { kind: 'success', text: renderProfileList(profiles) };
                }
                const profile = profiles.get(profileName);
                if (profile === undefined)
                    return { kind: 'error', text: `Unknown prompt profile "${profileName}".` };
                const state = profile.provider === undefined ? undefined : selectionState(agent, selections);
                if (state?.temporary === true) {
                    return { kind: 'error', text: 'Another restoring prompt profile is still running for this agent.' };
                }
                const previous = state?.ref.current;
                if (state !== undefined && profile.provider !== undefined && profile.model !== undefined) {
                    state.ref.current = {
                        provider: profile.provider,
                        model: profile.model,
                        ...(profile.reasoningEffort === undefined
                            ? {}
                            : { reasoningEffort: ReasoningEffortId(profile.reasoningEffort) }),
                    };
                    state.temporary = profile.restore;
                }
                const prompt = substituteArguments(profile.body, args);
                agent.followup(createUserMessage({
                    content: [{ type: 'text', text: prompt }],
                    source: {
                        kind: 'plugin',
                        plugin: name,
                        form: 'notice',
                        summary: `Started prompt profile ${profile.name}.`,
                    },
                }));
                if (state !== undefined && profile.restore) {
                    void agent.whenIdle().finally(() => {
                        state.ref.current = previous;
                        state.temporary = false;
                    });
                }
                const selection = profile.provider === undefined
                    ? 'the current model'
                    : `${profile.provider}/${profile.model}`;
                return { kind: 'success', text: `Started prompt profile "${profile.name}" with ${selection}.` };
            }
            catch (error) {
                return { kind: 'error', text: error instanceof Error ? error.message : String(error) };
            }
        },
    });
}
function selectionState(agent, states) {
    const existing = states.get(agent);
    if (existing !== undefined)
        return existing;
    const ref = { current: undefined, assembled: undefined };
    const state = { ref, dispose: installModelSelection(agent.ctx, ref), temporary: false };
    states.set(agent, state);
    return state;
}
//# sourceMappingURL=index.js.map