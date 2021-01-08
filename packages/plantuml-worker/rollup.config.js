import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  plugins: [externals({ deps: true }), resolve(), typescript()],
  output: [
    {
      exports: 'auto',
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      exports: 'auto',
      file: 'dist/index.min.js',
      format: 'cjs',
      plugins: [terser()],
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.min.js',
      format: 'esm',
      plugins: [terser()],
      sourcemap: true
    }
  ]
};
