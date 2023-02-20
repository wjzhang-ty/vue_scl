import { isFunction, isObject } from "@vue/shared"
import { ShapeFlags } from "packages/shared/src/shapeFlags"
import { componentPublicInstance } from "./componentPublicInstance"

// 获取当前实例
export const getCurrentInstance = ()=>{
    return currentInstance
}
export const setCurrentInstance = (target)=>{
    currentInstance=target
}

/**
 * 创建组件实例
 * @param vnode 
 * @returns 
 */
export const createComponentInstance = (vnode) => {
    const instance = {
        vnode,
        type:vnode.type,
        props: {}, // 组件属性
        attrs: {}, // dom属性
        setupState: {},
        ctx: {}, // 代理
        proxy: {}, // 
        data:{},
        render:false,
        isMounted: false // 是否挂载
    }
    instance.ctx = { _: instance }
    return instance
}

/**
 * 补充组件实例的值
 * @param vnode 
 */
export const setupComponent = (instance) => {
    const { props, children } = instance.vnode
    instance.props = props
    instance.children = children // 插槽

    let shapeFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    if (shapeFlag) {
        setupStateComponent(instance)
    }

}

export let currentInstance
/**
 * 处理组件内部setup函数
 * @param instance 
 */
export const setupStateComponent = (instance) => {
    instance.proxy = new Proxy(instance.ctx,componentPublicInstance as any)
    let Component = instance.type
    let {setup} = Component
    if(setup){   
        currentInstance = instance // 创建全局实例
        let setupContext = createContext(instance)
        // setup返回对象（正常值）和函数（当render函数）
        let res = setup(instance.props,setupContext)
        currentInstance=null
        handlerSetupResult(instance,res)
    }
    else{
        finishComponentSetup(instance)
    }
    
    // Component.render(instance.proxy)
}

/**
 * 处理setup返回结果
 * @param instance 实例
 * @param result setup返回结果
 */
function handlerSetupResult(instance,result){
    if(isFunction(result)){
        instance.render = result
    }
    else if(isObject(result)){
        instance.setupState = result
    }
    finishComponentSetup(instance)
}

/**
 * 处理render
 * @param instance 
 */
function finishComponentSetup(instance){
    let Component = instance.type
    if(!instance.render){
        
        if(!Component.render&&Component.template){
            // ⭐未完成，模板编译
        }
        instance.render = Component.render
    }
}


function createContext(instance){
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: ()=>{},
        expose: ()=>{}
    }
}
