import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import { terser } from 'rollup-plugin-terser'
import camelCase from 'lodash.camelcase'
import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import pkg from './package.json'

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

const libraryName = '--libraryname--'

/**
 * Comment with library information to be appended in the generated bundles.
 */
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author}
 * Released under the ${pkg.license} License.
 */
`

/**
 * Creates an output options object for Rollup.js.
 * @param {import('rollup').OutputOptions} options
 * @returns {import('rollup').OutputOptions}
 */
function createOutputOptions(options) {
  return {
    banner,
    name: `${libraryName}`,
    sourcemap: true,
    // https://rollupjs.org/guide/en/#outputexports
    exports: 'named',
    ...options,
  };
}

/**
 * @type {import('rollup').RollupOptions}
 */
const options = {
  input: `src/${libraryName}.js`,
  output: [
    createOutputOptions({
      file: pkg.module,
      format: 'es',
    }),
    createOutputOptions({
      file: pkg.main,
      format: 'umd',
      // this is the name of the global object
      name: `${camelCase(libraryName)}`
    }),
    createOutputOptions({
      file: `./dist/${libraryName}.umd.min.js`,
      format: 'umd',
      plugins: [terser()],
      // this is the name of the global object
      name: `${camelCase(libraryName)}`
    }),
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external,
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow json resolution
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    babel({
      babelHelpers: 'bundled'
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/plugins/tree/master/packages/node-resolve
    nodeResolve(),
    // Resolve source maps to the original source
    sourceMaps()
  ],
};

export default options;
