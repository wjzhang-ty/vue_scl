import { hasChange, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { Track, trigger } from "./effect"
import { TrackOpType, TriggerOpTypes } from "./operations"
import { reactive, readonly } from "./reactive"

export const reactiveHandlers ={
    get: createGetter(),
    set: createSetter()
}
export const shallowReactiveHandlers ={
    get: createGetter(false,true),
    set: createSetter(true)

}
export const readonlyHandlers ={
    get: createGetter(true),
    set: (target,key,value)=>{
        console.warn("只读属性不可修改")
    }
}
export const shallowReadonlyHandlers ={
    get: createGetter(true,true),
    set: (target,key,value)=>{
        console.warn("只读属性不可修改")
    }
}

/**
 * 获取set函数
 * @param isShallow 是否浅代理，默认false深代理
 * @returns 
 */
function createSetter(isShallow=false){
    return function set(target,key,value,receiver){
        const oldValue = target[key]

        // 深代理
        // const res = Reflect.get(target,key,receiver)
        // if(!isShallow && isObject(res)){
        //     return reactive(res)
        // }

        // 
        const result = Reflect.set(target,key,value,receiver)
        // 判断属性key是新增还是修改
        let haskey = isArray(target)&&isIntegerKey(key)?Number(key)<target.length:hasOwn(target,key)
        if(!haskey){ // 新增key
            trigger(target,TriggerOpTypes.ADD,key,value)
        }
        else if(hasChange(value,oldValue)){ // 无修改
            trigger(target,TriggerOpTypes.ADD,key,value,oldValue)
        }
        return result
    }
}

/**
 * 获取get函数
 * @param isReadonly 是否只读，默认false不只读
 * @param isShallow 是否浅代理，默认false深代理
 * @returns 
 */
function createGetter(isReadonly=false,isShallow=false){
    return function get(target,key,receiver){
        const res = Reflect.get(target,key,receiver)
        
        // 收集依赖
        if(!isReadonly){
            Track(target,TrackOpType.GET,key)
        }

        // proxy默认浅层代理
        if(isShallow){
            return res
        }

        // ⭐懒代理：如果key是深层属性，被调用时再去递归
        if(isObject(res)){
            return isReadonly?readonly(res):reactive(res)
        }
        return res
    }
}