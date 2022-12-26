const fs = require('fs')
const execa = require('execa')

/* 1. 获取打包目录：packages下的所有文件夹 */
const dirs = fs.readdirSync('packages').filter(filename=>{
    return fs.statSync(`packages/${filename}`).isDirectory()
})

/* 2. 打包 */
// 2.1 打包函数
async function build(target){
    await execa('rollup',['-c','--environment',`TARGET:${target}`],{stdio:'inherit'})
}
// 2.2 并行调用打包
async function runParaller(dirs,itemfn){
    let result = []
    for(let item of dirs){
        result.push(itemfn(item))
    }
    return Promise.all(result)
}
// 2.3 打包逻辑入口
runParaller(dirs,build).then(()=>{
    console.log("打包成功")
})