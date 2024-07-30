import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { swc } from 'rollup-plugin-swc3';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/bundle.js',
        format: 'esm'
    },
    plugins: [
        resolve(),
        commonjs({
            include: 'node_modules/**',
            transformMixedEsModules: true,
        }),
        json(),
        swc({
            jsc: {
                target: 'es2015',
                parser: {
                    syntax: 'typescript'
                }
            }
        })
    ]
};
