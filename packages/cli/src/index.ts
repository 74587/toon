import type { ArgsDef, CommandDef } from 'citty'
import type { Delimiter } from '../../toon/src/index.ts'
import type { InputSource } from './types.ts'
import * as path from 'node:path'
import { defineCommand } from 'citty'
import { DEFAULT_DELIMITER } from '../../toon/src/index.ts'
import { assertValidDelimiter } from '../../toon/src/shared/validation.ts'
import pkg from '../package.json' with { type: 'json' }
import { decodeToJson, encodeToToon } from './conversion.ts'
import { CliError, commonArgs, withCleanErrors } from './errors.ts'
import { detectMode } from './utils.ts'

const { name, version } = pkg

const args: ArgsDef = {
  ...commonArgs,
  input: {
    type: 'positional',
    description: 'Input file path (omit or use "-" to read from stdin)',
    required: false,
  },
  output: {
    type: 'string',
    description: 'Output file path',
    alias: 'o',
  },
  encode: {
    type: 'boolean',
    description: 'Encode JSON to TOON (auto-detected by default)',
    alias: 'e',
  },
  decode: {
    type: 'boolean',
    description: 'Decode TOON to JSON (auto-detected by default)',
    alias: 'd',
  },
  delimiter: {
    type: 'string',
    description: 'Delimiter for rows and inline arrays: comma (,), tab (\\t), or pipe (|)',
    default: ',',
  },
  indent: {
    type: 'string',
    description: 'Indentation size',
    default: '2',
  },
  strict: {
    type: 'boolean',
    description: 'Strict decode validation (disable with --no-strict)',
    default: true,
  },
  stats: {
    type: 'boolean',
    description: 'Show token statistics',
    default: false,
  },
} as const

export const mainCommand: CommandDef<ArgsDef> = withCleanErrors(defineCommand({
  meta: {
    name,
    description: 'TOON CLI – Convert between JSON and TOON',
    version,
  },
  args,
  async run({ args }) {
    const input = args.input

    const inputSource: InputSource = !input || input === '-'
      ? { type: 'stdin' }
      : { type: 'file', path: path.resolve(input) }
    const outputPath = args.output ? path.resolve(args.output) : undefined

    const indentSize = Number.parseInt(args.indent || '2', 10)
    if (Number.isNaN(indentSize) || indentSize < 0) {
      throw new CliError(`Invalid indent value: ${args.indent}`)
    }

    const delimiter = args.delimiter || DEFAULT_DELIMITER
    assertDelimiter(delimiter)

    const mode = detectMode(inputSource, args.encode, args.decode)

    if (mode === 'encode') {
      await encodeToToon({
        input: inputSource,
        output: outputPath,
        delimiter,
        indentSize,
        shouldPrintStats: args.stats === true,
      })
    }
    else {
      await decodeToJson({
        input: inputSource,
        output: outputPath,
        indentSize,
        strict: args.strict !== false,
      })
    }
  },
}))

/**
 * The library reports a bad delimiter as a `TypeError`, which the boundary would
 * read as a defect rather than as the flag value the user chose.
 */
function assertDelimiter(delimiter: string): asserts delimiter is Delimiter {
  try {
    assertValidDelimiter(delimiter)
  }
  catch (error) {
    throw new CliError(Error.isError(error) ? error.message : String(error), { cause: error })
  }
}
