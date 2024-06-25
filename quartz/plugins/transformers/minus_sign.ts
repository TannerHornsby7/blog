import { QuartzTransformerPlugin } from "../types"
import { Plugin } from "unified"

const numberMatch = /(^|\s)\-(\s?\d*\.?\d+)/g

const minusReplace: Plugin = (text: string) => {
  return text.replaceAll(numberMatch, "$1−$2")
}

export const MinusReplaceTransform: QuartzTransformerPlugin = () => {
  return {
    name: "MinusReplace",
    textTransform(_ctx, src) {
      if (src instanceof Buffer) {
        src = src.toString()
      }
      return minusReplace(src)
    },
  }
}
