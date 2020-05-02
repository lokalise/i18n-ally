// rollup.config.js
import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: path.resolve(__dirname, './client.ts'),
  output: {
    dir: path.resolve(__dirname, '../../../dist/server'),
    format: 'iife',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
  ],
}
