import { Node, Root } from "hast"
import { Components, Jsx, toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import React, { HTMLAttributes } from "react"

import { type FilePath } from "./path"
import { trace } from "./trace"

const customComponents: Partial<Components> = {
  table: (props) => {
    if (typeof props.defaultValue === "number") {
      props.defaultValue = props.defaultValue.toString()
    }
    return (
      <div className="table-container">
        <table {...(props as unknown as HTMLAttributes<HTMLTableElement>)} />
      </div>
    )
  },
}

export function htmlToJsx(fp: FilePath, tree: Node) {
  try {
    return toJsxRuntime(tree as Root, {
      Fragment,
      jsx: jsx as Jsx,
      jsxs: jsxs as Jsx,
      elementAttributeNameCase: "html",
      components: customComponents,
    })
  } catch (e) {
    trace(`Failed to parse Markdown in \`${fp}\` into JSX`, e as Error)
  }
}
