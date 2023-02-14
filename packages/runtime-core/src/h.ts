import { isArray, isObject } from "@vue/shared"
import { createVNode, isVnode } from "./vnode"

/**
 * h语法转vnode
 * @param type 类型
 * @param propsOrChildren 属性或子节点 
 * @param children 子节点
 */
export function h(type,propsOrChildren,children=null){
    const argLen = arguments.length
    if(argLen==2){
        // h('div',Object)
        if(isObject(propsOrChildren) && !isArray(propsOrChildren)){
            // h('div',h(...))
            if(isVnode(propsOrChildren)){
                return createVNode(type,null,[propsOrChildren])
            }
            // h('div',{attr:...})
            return createVNode(type,propsOrChildren)
        }
        else{
            // h('div',[...])
            return createVNode(type,null,propsOrChildren)

        }
    }else{
        if(argLen>3){
            // h('div',{attr:...},xx,xx,xxx)
            children = Array.prototype.slice.call(arguments,2)
        }else if(argLen==3&& isVnode(children)){
            // h('div',{attr:...},h(...))
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}