export const isNumber = (v: any) => typeof v === 'number'
export const isString = (v: any) => typeof v === 'string'
export const isBoolean = (v: any) => typeof v === 'boolean'
export const isNull = (v: any) => v === null

export const isArray = (v: any) => Object.prototype.toString.call(v) === '[object Array]'

export const isObject = (v: any) => Object.prototype.toString.call(v) === '[object Object]'

const isComplex = (v: any) => typeof v === 'object' && !isNull(v)
const isPrimary = (v: any) => !isComplex(v)

export function calcTotal(value: object, isJsonStrToObject: boolean, deep: number = 1) {
  const ans: renderArray = []
  ans.push({
    type: 'leftBracket',
    key: null,
    renderValue: isArray(value) ? '[' : '{',
    length: Object.keys(value).length,
    dataType: isArray(value) ? 'Array' : 'Object',
    deep: 0,
    open: true,
    rightBracket: isArray(value) ? ']' : '}'
  })

  getAllRow(value, deep)

  ans.push({
    type: 'rightBracket',
    key: null,
    renderValue: isArray(value) ? ']' : '}',
    rightBracket: isArray(value) ? ']' : '}',
    deep: 0
  } as renderItem)

  return ans.map((x, index) => ({ index, ...x }))

  function getAllRow(value: any, deep: number): void {
    const keys = Object.keys(value)
    keys.forEach((key, idx) => {
      let mainValue = value[key]

      // 如果是原始类型
      if (isPrimary(mainValue)) {
        if (isJsonStrToObject && isJSONStr(mainValue)) {
          mainValue = JSON.parse(mainValue)
          handleObject()
        } else {
          ans.push({
            type: 'key-value',
            key,
            renderValue: typeof mainValue === 'string' ? `'${mainValue}'` : String(mainValue),
            deep,
            isComma: idx !== keys.length - 1,
            className: mainValue === null ? 'null' : typeof mainValue
          })
        }
      } else handleObject()

      function handleObject() {
        ans.push({
          type: 'key-leftBracket',
          key,
          renderValue: isArray(mainValue) ? '[' : '{',
          rightBracket: isArray(mainValue) ? ']' : '}',
          deep,
          open: true,
          length: Object.keys(mainValue).length,
          dataType: isArray(mainValue) ? 'Array' : 'Object'
        })

        getAllRow(mainValue, deep + 1)

        ans.push({
          type: 'rightBracket',
          key: null,
          renderValue: isArray(mainValue) ? ']' : '}',
          deep,
          isComma: idx !== keys.length - 1
        })
      }
    })
  }
}

export const getAllBracket = (array: renderArray) => {
  const ak = array.filter(item => ['leftBracket', 'key-leftBracket', 'rightBracket'].includes(item.type))

  const bracketArray: UBracketArray = []
  const stack: number[] = []

  ak.forEach(item => {
    if (['[', '{'].includes(item.renderValue)) stack.push(item.index)
    else bracketArray.push({ startIdx: stack.pop(), endIdx: item.index, open: true })
  })

  return bracketArray
}

// 是否为 json 字符串
function isJSONStr(str: string) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
