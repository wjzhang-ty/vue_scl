import { isArray, isObject, isString } from "@vue/shared"
import { ShapeFlags } from "packages/shared/src/shapeFlags"

/**
 * 创建虚拟DOM
 * @param type 类型
 * @param props 属性
 * @param children 子集
 */
export const createVNode = (type, props, children = null)=>{
    const vnode = {
        _v_isVnode: true,
        type,
        props,
        children,
        key: props && props.key, // diff用
        el: null, // DOM节点
        component:{},
        // 组件类型
        shapeFlag: isString(type)?ShapeFlags.ELEMENT:isObject(type)?ShapeFlags.STATEFUL_COMPONENT:0
    }
    // 添加子集标识，例：h('div',{style:{color:red}},[...children])
    normalizeChildren(vnode,children)
    return vnode
}

/**
 * 补充子集类型
 * @param vnode 虚拟dom
 * @param children 虚拟dom的子节点
 */
function normalizeChildren(vnode, children){
    let type = 0
    if(children==null){

    }else if(isArray(children)){
        type = ShapeFlags.ARRAY_CHILDREN
    }else{
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag = type | vnode.shapeFlag
}


export function isVnode(vnode){
    return vnode._v_isVnode
}

export const TEXT = Symbol('text')
// 文本类型转vnode
export function CVnode(child){
    if(isObject(child)) return child
    return createVNode(TEXT,null,String(child))
}

/**
 * 比对n1和n2是否为同一个VNode
 * @param n1 
 * @param n2 
 * @returns 
 */
export function isSameVnode(n1,n2){
    return n1.type == n2.type && n1.key == n2.key
}