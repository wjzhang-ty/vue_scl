import { isObject } from "@vue/shared"
import {reactiveHandlers,shallowReactiveHandlers,readonlyHandlers,shallowReadonlyHandlers} from "./baseHandler"

export function reactive(target){
    return createReactObj(target,false,reactiveHandlers)
}


export function shallowReactive(target){
    return createReactObj(target,false,shallowReactiveHandlers)
}


export function readonly(target){
    return createReactObj(target,false,readonlyHandlers)
}


export function shallowReadonly(target){
    return createReactObj(target,false,shallowReadonlyHandlers)
}

/* 缓存 */
const reactiveMap = new WeakMap() 
const readonlyMap = new WeakMap()
function createReactObj(target,isReadonly,baseHandlers){
    // target必须是对象
    if(!isObject(target)) return target

    // 如果已经创建过代理了，从缓存中返回
    const map = isReadonly?readonlyMap:reactiveMap
    const temp = map.get(target)
    if(temp) return temp

    // 创建代理
    const proxy = new Proxy(target,baseHandlers)
    map.set(target,proxy)
    return proxy
}