import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { createLogger } from "../plugins/transformers/logger_utils"
import modernStyle from "./styles/toc.scss"
import { classNames } from "../util/lang"
import { Parent, Text, Element } from "hast"
import { replaceSCInNode } from "../plugins/transformers/tagacronyms"
import { TocEntry } from "../plugins/transformers/toc"
// @ts-expect-error
import script from "./scripts/toc.inline"
import katex from "katex"

function processSmallCaps(text: string, parent: Parent): void {
  const textNode = { type: "text", value: text } as Text
  parent.children.push(textNode)
  replaceSCInNode(textNode, 0, parent)
}

function processKatex(latex: string, parent: Parent): void {
  const html = katex.renderToString(latex, { throwOnError: false })
  const katexNode = {
    type: "element",
    tagName: "span",
    properties: { className: ["katex-toc"] },
    children: [{ type: "raw", value: html }],
  } as Element
  parent.children.push(katexNode)
}

const logger = createLogger("TableOfContents")
/**
 * TableOfContents component for rendering a table of contents.
 * 
 * @param {QuartzComponentProps} props - The component props.
 * @param {QuartzPluginData} props.fileData - Data for the current file.
 * @param {string} [props.displayClass] - CSS class for controlling display.
 * @returns {JSX.Element | null} The rendered table of contents or null if disabled.
 */
const TableOfContents: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  logger.info(`Rendering TableOfContents for file: ${fileData.filePath}`)

  if (!fileData.toc || fileData.frontmatter?.toc === "false") {
    logger.info(
      `TableOfContents skipped for ${fileData.filePath}: no TOC data or disabled in frontmatter`,
    )
    return null
  }

  const title = fileData.frontmatter?.title
  logger.debug(`Title for TOC: ${title}`)

  const toc = addListItem(fileData.toc, 0)
  logger.debug(`Generated TOC items: ${toc.length}`)

  return (
    <div id="table-of-contents" class={classNames(displayClass)}>
      <h6 class="toc-title">
        <a href="#">{title}</a>
      </h6>
      <div id="toc-content">
        <ul class="overflow">{toc}</ul>
      </div>
    </div>
  )
}

/**
 * Recursively generates list items for the table of contents.
 * 
 * @param {TocEntry[]} remainingEntries - The remaining TOC entries to process.
 * @param {number} currentDepth - The current depth in the TOC hierarchy.
 * @returns {JSX.Element[]} An array of JSX elements representing the TOC items.
 */
function addListItem(remainingEntries: TocEntry[], currentDepth: number): JSX.Element[] {
  logger.debug(
    `addListItem called with ${remainingEntries.length} entries at depth ${currentDepth}`,
  )

  if (remainingEntries.length === 0) {
    logger.debug("No remaining entries, returning empty array")
    return []
  }

  let result = []
  while (remainingEntries.length > 0) {
    const tocEntry = remainingEntries[0]
    logger.debug(`Processing TOC entry: ${JSON.stringify(tocEntry)}`)

    if (tocEntry.depth > currentDepth) {
      logger.debug(`Starting new sublist at depth ${tocEntry.depth}`)
      result.push(<ul>{addListItem(remainingEntries, tocEntry.depth)}</ul>)
    } else if (tocEntry.depth < currentDepth) {
      logger.debug(`Ending sublist, returning to depth ${tocEntry.depth}`)
      break
    } else {
      remainingEntries.shift()
      const entryParent: Parent = processSCInTocEntry(tocEntry)
      const children = entryParent.children.map(elementToJsx)
      let childElts: JSX.Element[] = []
      for (let i = 0; i < children.length; i++) {
        childElts.push(children[i])
      }
      let li = (
        <li key={tocEntry.slug} className={`depth-${tocEntry.depth}`}>
          <a href={`#${tocEntry.slug}`} data-for={tocEntry.slug}>
            {childElts}
          </a>
        </li>
      )
      logger.debug(`Added list item for "${tocEntry.text}" at depth ${tocEntry.depth}`)
      result.push(li)
    }
  }

  logger.debug(`Returning ${result.length} list items`)
  return result
}

/**
 * Processes small caps and LaTeX in a TOC entry.
 * 
 * @param {TocEntry} entry - The TOC entry to process.
 * @returns {Parent} A Parent object representing the processed entry.
 */
function processSCInTocEntry(entry: TocEntry): Parent {
  logger.debug(`Processing SC in TOC entry: ${entry.text}`)
  const parent = { type: "element", tagName: "span", properties: {}, children: [] } as Parent

  // Split the text by LaTeX delimiters
  const parts = entry.text.split(/(\$[^$]+\$)/g)

  parts.forEach((part) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      // LaTeX expression
      const latex = part.slice(1, -1)
      processKatex(latex, parent)
    } else {
      // Regular text
      processSmallCaps(part, parent)
    }
  })

  return parent
}

/**
 * Converts a HAST element to a JSX element.
 * 
 * @param {any} elt - The HAST element to convert.
 * @returns {JSX.Element} The converted JSX element.
 * @throws {Error} If an unknown element type is encountered.
 */
import { Element as HastElement } from "hast"

function elementToJsx(elt: HastElement | Text): JSX.Element {
  logger.debug(`Converting element to JSX: ${JSON.stringify(elt)}`)
  if (elt.type === "text") {
    return <>{elt.value}</>
  } else if (elt.tagName === "abbr") {
    const abbrText = (elt.children[0] as Text).value
    const className = (elt.properties?.className as string[])?.join(" ") || ""
    return <abbr class={className}>{abbrText}</abbr>
  } else if (elt.tagName === "span") {
    if ((elt.properties?.className as string[])?.includes("katex-toc")) {
      return (
        <span className="katex-toc" dangerouslySetInnerHTML={{ __html: (elt.children[0] as { value: string }).value }} />
      )
    } else {
      // Handle other span elements (e.g., those created by processSmallCaps)
      return <span>{elt.children.map((child) => elementToJsx(child as HastElement | Text))}</span>
    }
  } else {
    logger.error(`Unknown element type: ${elt.type}`)
    throw Error("Unknown element type")
  }
}

TableOfContents.css = modernStyle
TableOfContents.afterDOMLoaded = script

export default ((_opts?: any): QuartzComponent => {
  logger.info("TableOfContents component initialized")
  return TableOfContents
}) satisfies QuartzComponentConstructor
