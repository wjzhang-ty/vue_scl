
export const patchEvent = (el,key,cb)=>{
    // _vei:缓存已绑定的事件
    const invokers = el._vei || (el._vei={})
    const exist = invokers[key]

    // 修改事件
    if(exist && cb){
        exist.cb=cb
    }else{
        const eventName = key.slice(2).toLowerCase()
        // 新增事件
        if(cb){
            let invoker = invokers[eventName] = createInvoker(cb)
            el.addEventListener(eventName,invoker)
        }
        // 删除事件
        else{
            el.removeEventLisenter(eventName,exist)
            invokers[eventName] = undefined
        }
    }
}

function createInvoker(fn){
    const invoker = e =>{
        invoker.cb(e) // 在下面
    }
    invoker.cb = fn
    return invoker
}