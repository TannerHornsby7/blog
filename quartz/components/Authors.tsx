import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const Authors: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  if (fileData.frontmatter?.hide_metadata) {
    return null
  }
  let authors = "Alex Turner"
  if (fileData.frontmatter?.authors) {
    authors = fileData.frontmatter?.authors as string
  }
  authors = "By " + authors
  if (fileData.frontmatter?.hide_authors) {
    return ""
  }

  // Display reading time if enabled
  const text = fileData.text
  const { minutes, words: _words } = readingTime(text)
  const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
    minutes: Math.ceil(minutes),
  })
  authors = `${authors}`

  return (
    <p class="authors">
      {authors} ({displayedTime})
      <br />
    </p>
  )
}

export default (() => Authors) satisfies QuartzComponentConstructor
