import { hasChanged } from "@vue/shared"
import { Track, trigger } from "./effect"
import { TrackOpType, TriggerOpTypes } from "./operations"

export function ref(rawValue){
    return new RefImpl(rawValue)
}

export function shallowRef(rawValue){
    return new RefImpl(rawValue,true)
}

export function toRef(obj,key){
    return new ObjectRefImpl(obj,key)
}

export function toRefs(obj){
    for(let key in obj){
        obj[key] = toRef(obj,key)
    }
    return obj
}

/**
 * 返回响应式的基本类型的ref
 */
class RefImpl{
    public _v_isRef = true
    public _value
    constructor(rawValue,isShallow=false){
        this._value=rawValue
    }

    get value(){
        Track(this,TrackOpType.GET,'value') // 收集依赖
        return this._value
    }
    set value(newValue){
        if(hasChanged(newValue,this._value)){
            this._value = newValue
            trigger(this,TriggerOpTypes.SET,'value',newValue)
        }
    }
}

/**
 * 对象的ref，返回ref类型，但不会添加响应式
 */
class ObjectRefImpl{
    public _v_isRef = true
    constructor(public target,public key){}
    get value(){
        return this.target[this.key]
    }
    set value(newValue){
        this.target[this.key]=newValue
    }
}