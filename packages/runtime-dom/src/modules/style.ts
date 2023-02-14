
export const patchStyle = (el, prevValue, nextValue) => {
    const style = el.style

    // 新值为空删除style
    if(!nextValue) el.removeAtteibute('style')
    else {
        // el中需要删除的style
        if(prevValue){
            for(let key in prevValue){
                if(!nextValue[key]){
                    style[key]=""
                }
            }
        }

        // 需要插入的style
        for(let key in nextValue){
            style[key]=nextValue[key]
        }
    }
}