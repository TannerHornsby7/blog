import matter from "gray-matter"
import { Root } from "hast"
import { toString } from "hast-util-to-string"
import { JSON_SCHEMA, load as loadYAML } from "js-yaml"
import remarkFrontmatter from "remark-frontmatter"
import toml from "toml"
import { VFile } from "vfile"

import { i18n } from "../../i18n"
import { escapeHTML } from "../../util/escape"
import { slugTag } from "../../util/path"
import { QuartzTransformerPlugin } from "../types"
import { QuartzPluginData } from "../vfile"
import { urlRegex } from "./utils"

export interface Options {
  delimiters: string | [string, string]
  language: "yaml" | "toml"
}

const defaultOptions: Options = {
  delimiters: "---",
  language: "yaml",
}

function coalesceAliases(data: { [key: string]: string[] }, aliases: string[]) {
  for (const alias of aliases) {
    if (data[alias] !== undefined && data[alias] !== null) return data[alias]
  }
  return []
}

// I don't want tags to be case-sensitive
function transformTag(tag: string): string {
  const trimmedTag = tag.trim()
  if (trimmedTag === "AI") return trimmedTag
  const newTag = tag.toLowerCase().trim().replace(/\s+/g, "-")
  return newTag
}

function coerceToArray(input: string | string[]): string[] | undefined {
  if (input === undefined || input === null) return undefined

  // coerce to array
  if (!Array.isArray(input)) {
    input = input
      .toString()
      .split(",")
      .map((tag: string) => tag.toLowerCase())
  }

  // remove all non-strings
  return input
    .filter((tag: unknown) => typeof tag === "string" || typeof tag === "number")
    .map((tag: string | number) => tag.toString())
}

export const FrontMatter: QuartzTransformerPlugin<Partial<Options> | undefined> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "FrontMatter",
    markdownPlugins({ cfg }) {
      return [
        [remarkFrontmatter, ["yaml", "toml"]],
        () => {
          return (tree: Root, file: VFile) => {
            const { data } = matter(Buffer.from(file.value), {
              ...opts,
              engines: {
                yaml: (s) => loadYAML(s, { schema: JSON_SCHEMA }) as object,
                toml: (s) => toml.parse(s) as object,
              },
            })

            if (data.title && data.title.toString() !== "") {
              data.title = data.title.toString()
            } else {
              data.title = file.stem ?? i18n(cfg.configuration.locale).propertyDefaults.title
            }

            const tags = coerceToArray(coalesceAliases(data, ["tags", "tag"]) || [])
            const lowerCaseTags = tags?.map((tag: string) => transformTag(tag))
            if (tags) data.tags = [...new Set(lowerCaseTags?.map((tag: string) => slugTag(tag)))]

            const aliases = coerceToArray(coalesceAliases(data, ["aliases", "alias"]) || [])
            if (aliases) data.aliases = aliases
            const cssclasses = coerceToArray(
              coalesceAliases(data, ["cssclasses", "cssclass"]) || [],
            )
            if (cssclasses) data.cssclasses = cssclasses

            // fill in frontmatter
            file.data.frontmatter = data as QuartzPluginData["frontmatter"]

            // Fill in text for search
            let text = escapeHTML(toString(tree))
            text = text.replace(urlRegex, "$<domain>$<path>")
            file.data.text = text
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    frontmatter: { [key: string]: unknown } & {
      title: string
    } & Partial<{
        tags: string[]
        aliases: string[]
        description: string
        publish: boolean
        draft: boolean
        lang: string
        enableToc: string
        cssclasses: string[]
      }>
  }
}
