// @ts-check
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import preserveDirectives from 'rollup-plugin-preserve-directives'

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const packageJson = require('./package.json')

const umdName = packageJson.name

const globals = {
  ...packageJson.devDependencies,
}

const dir = 'dist'

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  {
    input: './src/index.ts',
    // ignore lib
    external: ['lodash', 'lodash-es', ...Object.keys(globals)],

    output: {
      preserveModules: true,
      dir,
    },
    plugins: [
      nodeResolve(),
      commonjs({ include: 'node_modules/**' }),
      typescript({
        tsconfig: './src/tsconfig.json',
        declaration: false,
        outDir: dir,
      }),

      // @ts-ignore
      peerDepsExternal(),

      postcss({
        modules: {
          generateScopedName: '[hash:base64:5]',
        },
      }),
      preserveDirectives.default(),
    ],

    treeshake: true,
  },
]

// eslint-disable-next-line import/no-default-export
export default config
