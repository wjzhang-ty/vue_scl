// DOM操作：增删改查等
export const nodeOps = {
    createElement: tagName => document.createElement(tagName),
    removeElement: child => {
        const parent = child.parentNode
        if (parent) parent.removeChild(child)
    },
    insertElement: (child, parent, ancher = null) => {
        parent.insertBefore(child, ancher)
    },
    querySelecter: select => document.querySelector(select),
    setElementText: (el, text) => el.textContent = text,
    createText: text => document.createTextNode(text),
    setText: (node, text) => node.nodeValue = text
}