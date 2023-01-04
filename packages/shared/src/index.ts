
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
export const isArray = Array.isArray
export const isFunction = (val) => typeof val === 'function'
export const isNumber = (val) => typeof val === 'number'
export const isString = (val) => typeof val === 'string'

// key是否为整数
export const isIntegerKey = (key) => parseInt(key)+'' === key+''

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val,key)

export const hasChange = (val,oldval)=> val !== oldval