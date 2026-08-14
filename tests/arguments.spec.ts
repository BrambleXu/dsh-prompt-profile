import { describe, expect, it } from 'vitest'
import { splitArguments, substituteArguments } from '../src/arguments.js'

describe('prompt arguments', () => {
  it('splits quoted command input', () => {
    expect(splitArguments('review src/index.ts "edge cases"')).toEqual(['review', 'src/index.ts', 'edge cases'])
  })

  it('substitutes positional and rest placeholders', () => {
    expect(substituteArguments('File=$1 Focus=$2 All=$@ Tail=${@:2} Pair=${@:1:2}', ['a.ts', 'correctness', 'tests']))
      .toBe('File=a.ts Focus=correctness All=a.ts correctness tests Tail=correctness tests Pair=a.ts correctness')
  })
})
