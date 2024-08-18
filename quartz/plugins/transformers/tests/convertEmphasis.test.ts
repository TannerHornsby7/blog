import { formatNode } from "../convertEmphasis"
import { Text, Parent } from "mdast"

describe("formatNode", () => {
  it("should convert bold syntax correctly", () => {
    const node: Text = { type: "text", value: "This is **bold** text" }
    const parent: Parent = { type: "paragraph", children: [node] }
    const boldRegex = /\*\*(.*?)\*\*/g

    formatNode(node, 0, parent, boldRegex, "strong")

    expect(parent.children).toHaveLength(3)
    expect(parent.children[0]).toEqual({ type: "text", value: "This is " })
    expect(parent.children[1]).toEqual({
      type: "strong",
      children: [{ type: "text", value: "bold" }],
    })
    expect(parent.children[2]).toEqual({ type: "text", value: " text" })
  })

  it("should convert italic syntax correctly", () => {
    const node: Text = { type: "text", value: "This is _italic_ text" }
    const parent: Parent = { type: "paragraph", children: [node] }
    const italicRegex = /_(.*?)_/g

    formatNode(node, 0, parent, italicRegex, "em")

    expect(parent.children).toHaveLength(3)
    expect(parent.children[0]).toEqual({ type: "text", value: "This is " })
    expect(parent.children[1]).toEqual({
      type: "em",
      children: [{ type: "text", value: "italic" }],
    })
    expect(parent.children[2]).toEqual({ type: "text", value: " text" })
  })

  it("should handle multiple occurrences", () => {
    const node: Text = { type: "text", value: "**Bold** and **more bold**" }
    const parent: Parent = { type: "paragraph", children: [node] }
    const boldRegex = /\*\*(.*?)\*\*/g

    formatNode(node, 0, parent, boldRegex, "strong")

    expect(parent.children).toHaveLength(3)
    expect(parent.children[0]).toEqual({
      type: "strong",
      children: [{ type: "text", value: "Bold" }],
    })
    expect(parent.children[1]).toEqual({ type: "text", value: " and " })
    expect(parent.children[2]).toEqual({
      type: "strong",
      children: [{ type: "text", value: "more bold" }],
    })
  })

  it("should not modify text without emphasis", () => {
    const node: Text = { type: "text", value: "Plain text without emphasis" }
    const parent: Parent = { type: "paragraph", children: [node] }
    const boldRegex = /\*\*(.*?)\*\*/g

    formatNode(node, 0, parent, boldRegex, "strong")

    expect(parent.children).toHaveLength(1)
    expect(parent.children[0]).toEqual(node)
  })

  it("should throw an error for invalid tag", () => {
    const node: Text = { type: "text", value: "Some text" }
    const parent: Parent = { type: "paragraph", children: [node] }
    const regex = /\*\*(.*?)\*\*/g

    expect(() => formatNode(node, 0, parent, regex, "invalid")).toThrow("Invalid tag")
  })
})