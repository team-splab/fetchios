import { resolve } from 'path';
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const external = (id) => !id.startsWith('.') && !id.startsWith('/');

export default defineConfig([
  // ESM and CJS builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external,
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: 'dist',
        rootDir: 'src',
      }),
    ],
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'esm',
      },
      {
        file: 'dist/index.d.cts',
        format: 'cjs',
      },
    ],
    external,
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  },
]); 