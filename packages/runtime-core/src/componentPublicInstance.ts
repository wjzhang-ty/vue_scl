import { hasOwn } from "@vue/shared"

export const componentPublicInstance = {
    get({_:instance},key){
        const {props,data,setupState} = instance
        if(key[0]=="$") return
        else if(hasOwn(props,key)) return props[key]
        else if(hasOwn(setupState,key)) return setupState[key]
    },
    set({_:instance},key,value){
        const {props,data,setupState} = instance
        if(hasOwn(props,key)) props[key]=value
        else if(hasOwn(setupState,key)) setupState[key]=value
    }
}