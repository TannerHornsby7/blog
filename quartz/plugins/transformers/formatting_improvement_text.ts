import { QuartzTransformerPlugin } from "../types"
import { numberRegex, mdLinkRegex } from "./utils"

// Not followed by a colon (the footnote definition) or an opening parenthesis (md URL)
const footnoteRegex = /(\S) (\[\^.*?\])(?![:\(]) ?/g
const footnoteReplacement = "$1$2 "

const footnoteEndOfSentence = (text: string) => {
  let tighterText = text.replace(footnoteRegex, footnoteReplacement)

  return tighterText
}

const editPattern =
  /^\s*(?<emph1>[\*_]*)(edit|eta|note),?\s*\(?(?<date>\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\)?(?<emph2>[\*_]*:[\*_]*) (?<text>.*)/gim
const editAdmonitionPattern = "> [!info] Edited on $<date>\n> $<text>"
export function editAdmonition(text: string): string {
  text = text.replaceAll(editPattern, editAdmonitionPattern)
  return text
}

const notePattern = /^\s*(?<emph1>[\*_]*)note: (?<text>.*)(?<emph2>[\*_]*)/gim
export function noteAdmonition(text: string): string {
  text = text.replaceAll(notePattern, "\n> [!note]\n>\n> $1$2$3")
  return text
}

const concentrateEmphasisAroundLinks = (text: string): string => {
  const emphRegex = new RegExp(
    `(?<emph>[*_]+)(?<whitespace1>\\s*)(?<url>${mdLinkRegex.source})(?<whitespace2>\\s*)(\\k<emph>)`,
    "gm",
  )
  return text.replace(emphRegex, "$<whitespace1>$<emph>$<url>$<emph>$<whitespace2>")
}

export const formattingImprovement = (text: string) => {
  const yamlHeaderMatch = text.match(/^\s*---\n(.*?)\n---\n/s)
  let yamlHeader = ""
  let content = text

  if (yamlHeaderMatch) {
    yamlHeader = yamlHeaderMatch[0]
    content = text.substring(yamlHeader.length)
  }

  // Format the content (non-YAML part)
  // Get rid of NBSP
  let newContent = content.replaceAll(/(\u00A0|&nbsp;)/g, " ")

  newContent = footnoteEndOfSentence(newContent)
  // Pretty multiplication for 3x, 4x, etc.
  newContent = newContent.replace(new RegExp(`(${numberRegex.source})[x\\*]\\b`, "g"), "$1×")
  newContent = concentrateEmphasisAroundLinks(newContent)
  newContent = newContent.replace(/ *\,/g, ",")

  newContent = editAdmonition(newContent)
  newContent = noteAdmonition(newContent)

  return yamlHeader + newContent // Concatenate YAML header and formatted content
}

export const TextFormattingImprovement: QuartzTransformerPlugin = () => {
  return {
    name: "textFormattingImprovement",
    textTransform(_ctx, src) {
      if (src instanceof Buffer) {
        src = src.toString()
      }
      return formattingImprovement(src)
    },
  }
}
