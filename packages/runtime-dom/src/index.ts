/**
 * 为不同平台（web、小程序...）定义操作方法，不渲染
 */
import { createRender } from "@vue/runtime-core"
import { nodeOps } from "./nodeOps"
import { patchProps } from "./patchProp"

// web的操作
const renderOptionDom = Object.assign({ patchProps }, nodeOps)


/**
 * 创建vue APP
 * @param rootComponent 在此组件上渲染
 * @param rootProps 属性
 * @returns 
 */
export const createApp = (rootComponent, rootProps) => {
    // 获得渲染器
    let app = createRender(renderOptionDom).createApp(rootComponent, rootProps)
    let { mount } = app

    // 挂载组件
    app.mount = function (container) {
        container = nodeOps.querySelecter(container)
        container.innerHTML = ''
        mount(container)
    }
    return app
}

export * from "@vue/runtime-core"