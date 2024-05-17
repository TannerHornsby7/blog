import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backlinks.scss"
import { resolveRelative, simplifySlug } from "../util/path"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

const Backlinks: QuartzComponent = ({
  fileData,
  allFiles,
  displayClass,
  cfg,
}: QuartzComponentProps) => {
  const slug = simplifySlug(fileData.slug!)
  // TODO remove posts"
  const backlinkFiles = allFiles.filter((file) => file.links?.includes(slug))

  // Only render if there are backlinks
  if (backlinkFiles.length > 0) {
    return (
      <div class={classNames(displayClass, "backlinks")}>
        <h3>{i18n(cfg.locale).components.backlinks.title}</h3>
        <ul class="overflow">
          {backlinkFiles.map((f) => (
            <li>
              <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                {f.frontmatter?.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  } else {
    // Do nothing if there are no backlinks
    return null
  }
}

Backlinks.css = style
export default (() => Backlinks) satisfies QuartzComponentConstructor
