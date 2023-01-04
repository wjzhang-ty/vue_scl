import { isFunction } from "@vue/shared"
import { effect } from "./effect"


export function computed(getterOrOptions){
    let getter
    let setter
    // computed接受function时为只读属性
    if(isFunction(getterOrOptions)){
        getter = getterOrOptions,
        setter = ()=>{ console.warn('不能设置')}
    }else{
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }
    return new ComputedRefImpl(getter,setter)
}

/**
 * 计算属性实现类
 * _dirty：缓存机制的控制器，避免重复调用effect渲染
 * effect：把getter中属性打包成effect，实现响应式
 * ⭐提示：
 * computed不是一个变量无法装入effect
 * computed由多个变量构成，将构成变量装入effect
 */
class ComputedRefImpl{
    public _dirty = true // 默认可渲染
    public _value
    public effect // 用户传来的getter方法用于注册effect
    constructor(getter,public setter){
        this.effect = effect(getter,{
            lazy:true,
            onComputed:()=>{
                if(!this._dirty){
                    this._dirty=true // 触发构成变量的effect时更新缓存机制控制器
                }
            }
        })
    }

    get value(){
        if(this._dirty){
            this._value = this.effect() 
            this._dirty = false
        }
        return this._value
    }

    set value(newValue){
        this.setter(newValue)
    }
}