import { isObject } from "@vue/shared"
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
        console.log('set',key)
        if(isShallow){
            return Reflect.set(target,key,value,receiver)
        }
        const res = Reflect.get(target,key,receiver)
        if(isObject(res)){
            return reactive(res)
        }
        return Reflect.set(target,key,value,receiver)
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
        
        if(!isReadonly){

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