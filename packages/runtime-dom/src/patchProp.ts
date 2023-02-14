import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

// 策略模式，分发属性的操作
export const patchProps = (el, key, prevValue, nextValue) => {
    switch (key) {
        case 'class':
            patchClass(el, nextValue)
            break;

        case 'style':
            patchStyle(el, prevValue, nextValue)
            break;

        default:
            if(/^on[^a-z]/.test(key)){
                patchEvent(el,key,nextValue)
            }else{
                patchAttr(el,key,nextValue)
            }
            break;
    }

}