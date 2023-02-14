import { effect } from "@vue/reactivity"
import { ShapeFlags } from "@vue/shared/src/shapeFlags"
import { patchProps } from "packages/runtime-dom/src/patchProp"
import { apiCreateApp } from "./apiCreateApp"
import { createComponentInstance, setupComponent } from "./components"
import { CVnode, isSameVnode, TEXT } from "./vnode"

/**
 * 实现DOM渲染
 * @param renderOptionDom dom操作参数
 * @returns 
 */
export function createRender(renderOptionDom) {
    const {
        insertElement: hostInsert,
        removeElement: hostRemove,
        patchProps: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        // parentNode: hostParentNode,
        // nextSibling: hostNextSibling,
        // setScopeId: hostSetScopeId = NOOP,
        // insertStaticContent: hostInsertStaticContent
      } = renderOptionDom

    /**
     * 创建effect
     * @param instance 
     */
    function setupRenderEffect(instance,container){
        effect(function componentEffect(){
            let proxy = instance.proxy
            if(!instance.isMounted){
                let subTree = instance.subTree = instance.render.call(proxy,proxy)
                // 渲染子树
                patch(null,subTree,container)
                instance.isMounted=true
            }
            else{
                const prevTree = instance.subTree
                const nextTree = instance.render.call(proxy,proxy)
                instance.subTree = nextTree
                patch(prevTree,nextTree,container)
            }
        },{})
    }


    // 处理子元素
    function mountChildren(el,children){
        for(let i=0;i<children.length;i++){
            let child = CVnode(children[i]) // 文本类型转vnode
            patch(null,child,el)
        }
    }

    // 套娃末端，渲染函数
    const mountComponent = (initialVNode,container)=>{
        const instance = initialVNode.component = createComponentInstance(initialVNode)
        setupComponent(instance)
        setupRenderEffect(instance,container)
    }   
    // 套娃末端，渲染元素，真的在创建了
    const mountElement = (initialVNode,container,ancher)=>{
        const {props,shapeFlag,type,children} = initialVNode
        let el = initialVNode.el = hostCreateElement(type)
        // 添加属性
        if(props) for(let key in props){
            hostPatchProp(el,key,null,props[key])
        }
        // 处理子元素
        if(children){
            if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
                hostSetElementText(el,children)
            }
            else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
                mountChildren(el,children)
            }
        }
        hostInsert(el,container, ancher)
    }   

    // 组件创建
    const processComponent = (n1,n2,container)=>{
        // 首次加载
        if(n1==null){
            mountComponent(n2,container)
        }else{

        }
    }
    // 元素创建
    const processElement = (n1,n2,container,ancher)=>{
        // 首次加载
        if(n1==null){
            mountElement(n2,container,ancher)
        }else{
            patchElement(n1,n2,container,ancher)
        }
    }
    // 文本创建
    const processText = (n1,n2,container)=>{
        // 首次加载
        if(n1==null){
            hostInsert(n2.el=hostCreateText(n2.children),container)
        }else{

        }
    }


    /**
     * diff-child都是数组比对
     * @param c1 
     * @param c2 
     * @param el 
     */
    const patchkeyChild = (c1,c2,el)=>{
        let i = 0
        let e1 = c1.length-1
        let e2 = c2.length-1
        // 从前往后比对
        while(i<=e1&&i<=e2){
            const n1 = c1[i]
            const n2 = c2[i]
            if(isSameVnode(n1,n2)){
                patch(n1,n2,el)
                i++
            }
            else break
        }
        // 从后往前比对
        while(i<=e1&&i<=e2){
            const n1 = c1[e1]
            const n2 = c2[e2]
            if(isSameVnode(n1,n2)){
                patch(n1,n2,el)
                e1--
                e2--
            }
            else break
        }
        // 追加元素（往前追加）
        if(i>e1){
            const nextPros = e2 +1
            const ancher = nextPros<c2.length?c2[nextPros].el:null
            while(i<=e2){
                patch(null,c2[i++],el,ancher)
            }
        }else if(i>e2){ // 删除元素
            while(i<=e1){
                unmount(c1[i++])
            }
        }else{ // 乱序，能复用先复用，不行再插入
            let s1 = i
            let s2 = i
            const toBePatched = e2-s2+1 // 乱序表长度
            const newIndexToPatchMap = new Array(toBePatched).fill(0)
            let keyIndexMap = new Map() // 乱序表的映射
            for(let i = s2; i<=e2; i++){
                const childVnode = c2[i]
                keyIndexMap.set(childVnode.key,i)
            }
            // 能服用否？
            for(let i =s1;i<=e1;i++){
                const oldChildVnode = c1[i]
                let newIndex = keyIndexMap.get(oldChildVnode.key)
                if(newIndex === undefined){
                    unmount(oldChildVnode)
                }else{
                    newIndexToPatchMap[newIndex-s2]=i+1 // 旧队列中的位置
                    patch(oldChildVnode,c2[newIndex],el)
                }
            }
            // 不能复用，新增
            const increasingNewIndexSequence = getSequence(newIndexToPatchMap) // 最长递增子序列
            let j = increasingNewIndexSequence.length - 1
            console.log(increasingNewIndexSequence)
            for(let i = toBePatched-1;i>=0;i--){
                let currentIndex = i + s2
                let ancher = currentIndex+1<c2.length?c2[currentIndex+1].el:null
                if(newIndexToPatchMap[i]==0){
                    patch(null,c2[currentIndex],el,ancher)
                }else{
                    // 最长递增序列
                    if(i!=increasingNewIndexSequence[j]){
                        hostInsert(c2[currentIndex].el,el,ancher)
                    }
                    else j--
                }
            }

        }
    }

    /**
     * 比对子元素
     * @param n1 
     * @param n2 
     * @param el 
     */
    const patchChild=(n1,n2,el)=>{
        const c1 = n1.children
        const c2 = n2.children
        const oldFlag = n1.shapeFlag
        const newFlag = n2.shapeFlag
        // 新的值为文本
        if(newFlag & ShapeFlags.TEXT_CHILDREN){
            hostSetElementText(el,c2)
        }
        else{
            // 新旧都是数组
            if(oldFlag&ShapeFlags.ARRAY_CHILDREN){
                patchkeyChild(c1,c2,el)
            }
            // 新数组，旧文本
            else{
                hostSetElementText(el,'')
                mountChildren(el,c2)
            }
        }

    }

    /**
     * 比对属性
     * @param el 
     * @param oldProps 
     * @param newProps 
     */
    const patchProps=(el,oldProps,newProps)=>{
        if(oldProps != newProps){
            // 先循环新的，更新值
            for(let key in newProps){
                const oldProp = oldProps[key]
                const newProp = newProps[key]
                if(oldProp!=newProp){
                    hostPatchProp(el,key,oldProp,newProp)
                }
            }
            // 在循环旧的，删除多余属性
            for(let key in oldProps){
                if(!(key in newProps)){
                    hostPatchProp(el,key,newProps[key],null)
                }
            }
        }
    }
    /**
     * 同元素比对
     * @param n1 旧的vnode
     * @param n2 新的vnode
     * @param container 
     */
    const patchElement = (n1,n2,container,ancher)=>{
        let el = n2.el = n1.el
        const oldProps = n1.props || {}
        const newProps = n2.props || {}
        patchProps(el,oldProps,newProps)
        patchChild(n1,n2,el)
    }


    const unmount =(vnode)=>{
        hostRemove(vnode.el)
    }
    const patch = (n1,n2,container,ancher=null)=>{
        if(n1 && !isSameVnode(n1,n2)){
            console.log(111)
            unmount(n1)
            n1=null
        }
        let {shapeFlag,type} = n2
        switch(type){
            case TEXT:
                processText(n1,n2,container)
                break
            default:
                 // 元素类型vnode初始化
                if(shapeFlag & ShapeFlags.ELEMENT){
                    processElement(n1,n2,container,ancher)
                }
                // 组件类型vnode初始化
                else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
                    processComponent(n1,n2,container)
                }
        }
       
    }
    // 渲染器
    let render = (vnode, container)=>{
        patch(null,vnode,container)
    }
    return {
        createApp: apiCreateApp(render)
    }

}


// 最长子序列
function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
  }