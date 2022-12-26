const execa = require('execa')

/* 打包方法 */
async function build(target){
    await execa('rollup',['-cw','--environment',`TARGET:${target}`],{stdio:'inherit'})
}

build('reactivity')