import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import strip from '@rollup/plugin-strip';
import { terser } from "rollup-plugin-terser";

const output = (input, output, plugins) => ({
  input,
  output: Object.assign({
    name: 'proj4js',
    format: 'cjs'
  }, output),
  plugins
});

export default [
  output('./lib/index.slim.js', {
    dir: './dist/slim',
    format: 'es',
    chunkFileNames: (chunkName) => {
      if (chunkName.facadeModuleId) {
        if (chunkName.facadeModuleId.indexOf('projections')) return 'projections/[name].js'
      }
      return '[name].js'
    }
  },
  [dynamicImportVars()]
  ),
  // output('./lib/index.js', {
  //   file: './dist/complete/proj4.js'
  // },
  // [strip({labels: ['dynamic']})]
  // ),
  // output('./lib/index.js', {
  //   file: './dist/complete/proj4.min.js'
  // },
  // [strip({labels: ['dynamic']}), terser()]
  // )
]
