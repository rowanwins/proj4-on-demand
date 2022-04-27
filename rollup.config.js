import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import { terser } from "rollup-plugin-terser";
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

const output = (input, output, plugins) => ({
  input,
  output: Object.assign({
    name: 'proj4js',
    format: 'cjs'
  }, output),
  plugins
});

export default [
  output('./lib/ProjClass.js', {
    dir: './dist/standard',
    format: 'es',
    chunkFileNames: (chunkName) => {
      if (chunkName.facadeModuleId) {
        if (chunkName.facadeModuleId.indexOf('projections')) return 'projections/[name].js'
      }
      return '[name].js'
    }
  },
    [dynamicImportVars(), terser()]
  ),
  output('./lib/ProjClass.js', {
    dir: './dist/browserbundle',
    format: 'es',
    chunkFileNames: (chunkName) => {
      if (chunkName.facadeModuleId) {
        if (chunkName.facadeModuleId.indexOf('projections')) return 'projections/[name].js'
      }
      return '[name].js'
    }
  },
    [
      dynamicImportVars(),
      nodeResolve(),
      commonjs(),
      terser()
    ]
  )
]
