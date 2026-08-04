import type { ArgsDef, CommandDef } from 'citty'
import type { InputSource } from './types.ts'
import * as path from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import { DEFAULT_DELIMITER } from '../../toon/src/index.ts'
import { assertValidDelimiter } from '../../toon/src/shared/validation.ts'
import pkg from '../package.json' with { type: 'json' }
import { decodeToJson, encodeToToon } from './conversion.ts'
import { formatError } from './format-error.ts'
import * as log from './log.ts'
import { detectMode } from './utils.ts'

const { name, version } = pkg

const args: ArgsDef = {
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
  verbose: {
    type: 'boolean',
    description: 'Show full stack traces and cause chains for errors',
    default: false,
  },
} as const

export const mainCommand: CommandDef<ArgsDef> = defineCommand({
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

    try {
      const indentSize = Number.parseInt(args.indent || '2', 10)
      if (Number.isNaN(indentSize) || indentSize < 0) {
        throw new Error(`Invalid indent value: ${args.indent}`)
      }

      const delimiter = args.delimiter || DEFAULT_DELIMITER
      assertValidDelimiter(delimiter)

      const mode = detectMode(inputSource, args.encode, args.decode)

      if (mode === 'encode') {
        await encodeToToon({
          input: inputSource,
          output: outputPath,
          delimiter,
          indentSize,
          printStats: args.stats === true,
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
    }
    catch (error) {
      log.error(formatError(error, { isVerbose: args.verbose === true }))
      // `process.exit` would discard whatever stdout has still buffered, which
      // truncates a piped conversion partway through
      process.exitCode = 1
    }
  },
})
