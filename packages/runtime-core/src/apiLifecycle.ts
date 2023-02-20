import { currentInstance, setCurrentInstance } from "./components"

const enum lifeCycle{
    BEFORE_MOUNT='bm',
    MOUNTED='m',
    BEFORE_UPDATE='bu',
    UPDATED = 'u'
}

export const onBeforeMount = createHook(lifeCycle.BEFORE_MOUNT)
export const onMounted = createHook(lifeCycle.MOUNTED)
export const onBeforeUpdate = createHook(lifeCycle.BEFORE_UPDATE)
export const onUpdated = createHook(lifeCycle.UPDATED)



function createHook(lifecycle){
    /**
     * hook 用户定义的方法
     * target 组件实例
     */
    return function(hook,target= currentInstance){
        injectHook(lifecycle,hook,target)
    }
}

function injectHook(lifecycle,hook,target){
    if(!target){
        return
    }
    // 添加生命周期
    const hooks = target[lifecycle] || (target[lifecycle]=[])
    
    // 调用生命周期方法设置下全局instance
    const rap=()=>{
        setCurrentInstance(target)
        hook()
        setCurrentInstance(null)
    }
    hooks.push(rap) // 用户自定义生命周期方法
}

/**
 * 执行生命周期
 * @param fnArr 函数数组
 */
export function invokeArrayFns(fnArr){
    fnArr.forEach(fn=>fn())
}