
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
export const isArray = Array.isArray
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isString = (val: unknown): val is string => typeof val === 'string'

// key是否为整数
export const isIntegerKey = (key: unknown) => isString(key) && parseInt(key)+'' === key+''

export const hasOwn = (val: object, key: string | symbol) => Object.prototype.hasOwnProperty.call(val,key)

export const hasChanged = (val:any, oldval: any)=> !Object.is(val,oldval)