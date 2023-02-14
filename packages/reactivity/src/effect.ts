/**
 * 2022.12.29 依照当前的理解解释下effect
 * 1.用户通过effect（回调函数）为对象A添加“操作”，如DOM操作
 * 2.在定义effect时，会触发A的getter函数，在getter函数中收集依赖
 * 3.同理，当A被修改会触发A的setter函数，在setter函数中执行“操作”
 * 4.👍提示自己：
 *      proxy修改对象A的值，effect只负责执行修改后的“操作”，更新dom和更新值是分开的
 *      “操作”函数是用户定义的，所以只需要委托执行A中被更改属性的effect函数即可
 */
import { isArray, isIntegerKey } from "@vue/shared"
import { TriggerOpTypes } from "./operations"

export interface ReactiveEffectOptions {
    lazy?: boolean
    onComputed?: () => void
  }

/**
 * 收集依赖：依赖见targetMap
 * @param fn 用户传来的操作函数
 * @param options 配置项
 */
export function effect(fn, options:ReactiveEffectOptions){
    const effect = createReactEffect(fn, options={})
    if(!options.lazy){
        effect()
    }
    return effect
}

/**
 * 创建effect：effect创建过程中会触发被修改属性的getter函数（Track）
 * @param fn 用户传来的操作函数
 * @param options 配置项
 */
let uid = 0
let activeEffect // 为Track提供effect函数
const effectStack = [] // 栈可以解决嵌套effect（fn中定义新的effect）
function createReactEffect(fn, options){
    const effect = function reactiveEffect(){
        if(!effectStack.includes(effect)){
            try{
                effectStack.push(effect)
                activeEffect = effect
                return fn() // 执行fn会触发被使用到的属性的getter函数，由此触发Track收集依赖
            } finally{
                effectStack.pop()
                activeEffect = effectStack[effectStack.length-1] // arr[-1] -> undefined
            }
        }
    }
    // 额外的一些属性
    effect.id = uid++
    effect._isEffect = true
    effect.raw = fn
    effect.options = options
    return effect
}


/**
 * ⭐依赖容器：target对象 下的 key属性 在更新后需要执行 ...effect操作函数
 * WeakMap {
 *     target : Map {
 *          key : Set [...effect]
 *     }
 * }
 */
let targetMap = new WeakMap()


/**
 * 收集依赖：getter中调用。为targetMap提供所需格式的effect数据
 * @param target 对象
 * @param type 操作类型
 * @param key 对象的key
 * @returns 
*/
export function Track(target, type, key){
    // 没有在effect中使用
    if(!activeEffect) return
    
    let tempTarget = targetMap.get(target)
    if(!tempTarget) targetMap.set(target, (tempTarget = new Map))

    let tempKey = tempTarget.get(key)
    if(!tempKey) tempTarget.set(key, (tempKey = new Set))

    if(!tempKey.has(activeEffect)) tempKey.add(activeEffect)
    
}

/**
 * 渲染函数：setter中调用。执行被修改属性的effect函数
 * @param target 修改的对象
 * @param type 修改类型
 * @param key 对象的key
 * @param newValue 新的值
 * @param oldValue 旧的值
 * @returns 
 */
export function trigger(target,type,key,newValue,oldValue?){
    // 读取依赖容器中对应target的effect
    const depsMap = targetMap.get(target) // 得到map{}
    if(!depsMap) return

    // effect函数列表，set可以去重
    let effectSet = new Set()
    const add = (effectAdd) => {
        if(effectAdd){
            effectAdd.forEach(effect=>{
                effectSet.add(effect)
            })
        }
    }

    // 如果是更改数组长度需要单独处理。修改length存在多种情况，会使type判断失效
    if(key === 'length' && isArray(target)){
        depsMap.forEach((dep,key)=>{
            if(typeof key!='symbol' && (key==='length' || key>=newValue)){
                add(dep)
            }
        })
    } else {
        if(key!=undefined){
            add(depsMap.get(key))
        }
        switch(type){
            case TriggerOpTypes.ADD:
                if (isArray(target) && isIntegerKey(key)){
                    add(depsMap.get('length'))
                }
        }
    }
    
    effectSet.forEach((effect:any)=>{
        if(effect.options.onComputed){
            effect.options.onComputed(effect)
        }
        else effect()
    })

}