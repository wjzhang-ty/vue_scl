import ts from 'rollup-plugin-typescript2' // 解析ts
import json from '@rollup/plugin-json' // 解析json
import resolevPlugin from '@rollup/plugin-node-resolve' // 解析第三方插件
import path from 'path' // 处理路径

/* 1. 获取各个包的配置 */
const packagesDir = path.resolve(__dirname, 'packages') // packages文件夹路径
const packageDir = path.resolve(packagesDir, process.env.TARGET) // 子包路径
const resolve = p => path.resolve(packageDir,p) // 子包配置项目
const pkg = require(resolve('package.json')) // 子包json
const packageOptions = pkg.buildOptions||{} // 子包json中的配置项
const name = path.basename(packageDir) // 包名

/* 2. 输出规则映射表 */
const outputOptions = {
    "esm-bundler":{
        file:resolve(`dist/${name}.esm-bunder.js`),
        format:'es'
    },
    "cjs":{
        file:resolve(`dist/${name}.cjs.js`),
        format:'cjs'
    },
    "global":{
        file:resolve(`dist/${name}.global.js`),
        format:'iife'
    }
}
/* 3. 生成rollup配置 */
function createConfig(format,output){
    output.name = packageOptions.name // global需要name
    output.sourcemap = true // 可debug
    return{
        input:resolve('src/index.ts'),
        output,
        plugins:[
            json(), // 解析json
            ts({ // 解析ts
                tsconfig:path.resolve(__dirname,'tsconfig.json')
            }),
            resolevPlugin(), // 解析第三方插件
        ]
    }
}

/* 4. 导出配置 */
export default packageOptions.formats.map(format=>createConfig(format,outputOptions[format]))