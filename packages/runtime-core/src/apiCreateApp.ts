import { createVNode } from "./vnode"

/**
 * 创建虚拟DOM
 * @param render 渲染函数
 * @returns 
 */
export function apiCreateApp(render) {
    return function createApp(rootComponent, rootProps) {
        let app = {
            _component:rootComponent,
            _props:rootProps,
            _container:null,
            mount(container) {
                // 获得虚拟dom
                let vnode = createVNode(rootComponent, rootProps)
                // 渲染
                render(vnode, container)
                app._container = container
            }
        }
        return app
    }
}