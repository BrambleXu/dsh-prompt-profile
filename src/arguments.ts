/** Prompt-profile command argument parsing and template substitution. */

/** Split command input without invoking a shell. */
export function splitArguments(input: string): string[] {
  const result: string[] = []
  let token = ''
  let quote: '"' | "'" | undefined
  let escaped = false

  for (const character of input.trim()) {
    if (escaped) {
      token += character
      escaped = false
    } else if (character === '\\' && quote !== "'") {
      escaped = true
    } else if (quote !== undefined) {
      if (character === quote) quote = undefined
      else token += character
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (/\s/u.test(character)) {
      if (token.length > 0) {
        result.push(token)
        token = ''
      }
    } else {
      token += character
    }
  }

  if (escaped) token += '\\'
  if (quote !== undefined) throw new Error('profile arguments contain an unclosed quote')
  if (token.length > 0) result.push(token)
  return result
}

/** Substitute Pi-compatible positional placeholders in a prompt body. */
export function substituteArguments(template: string, args: readonly string[]): string {
  const all = args.join(' ')
  return template
    .replace(/\$ARGUMENTS|\$@|@\$/gu, all)
    .replace(/\$\{@:(\d+)(?::(\d+))?\}/gu, (_match, rawStart: string, rawLength?: string) => {
      const start = Number.parseInt(rawStart, 10) - 1
      if (start < 0) return ''
      const length = rawLength === undefined ? undefined : Number.parseInt(rawLength, 10)
      return args.slice(start, length === undefined ? undefined : start + length).join(' ')
    })
    .replace(/\$(\d+)/gu, (_match, rawIndex: string) => args[Number.parseInt(rawIndex, 10) - 1] ?? '')
}
