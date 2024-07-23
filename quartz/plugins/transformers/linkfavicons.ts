import { visit } from "unist-util-visit"
import path from "path"
import { followRedirects } from "./utils"
import { createLogger } from "./logger_utils"
import fs from "fs"

export const MAIL_PATH = "https://assets.turntrout.com/static/images/mail.svg"
const QUARTZ_FOLDER = "quartz"
const FAVICON_FOLDER = "static/images/external-favicons"
import { pipeline } from "stream/promises" // For streamlined stream handling

const logger = createLogger("linkfavicons")

/**
 * Downloads an image from a specified URL and saves it to the given file path.
 *
 * @param {string} url - The URL of the image to download.
 * @param {string} imagePath - The local file path where the image should be saved.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the download is successful, `false` otherwise.
 * @throws {Error} If there is an error during the download process.
 */
export async function downloadImage(url: string, imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      logger.info(`Failed to download: ${url} (Status ${response.status})`)
      return false
    }

    const fileStream = fs.createWriteStream(imagePath)
    await pipeline(response.body as any, fileStream)

    return true
  } catch (err) {
    logger.info(`Failed to download: ${url}\nEncountered ${err}`)
    fs.unlink(imagePath, () => {}) // Attempt to clean up (ignore errors)
    return false
  }
}

/**
 * Generates a standardized path for storing favicons based on the given hostname.
 *
 * @param {string} hostname - The hostname for which to generate the favicon path.
 * @returns {string} The generated favicon path.
 */
export function GetQuartzPath(hostname: string): string {
  if (hostname === "localhost") {
    hostname = "turntrout.com"
  }

  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4)
  }
  const sanitizedHostname = hostname.replace(/\./g, "_")
  return `/${FAVICON_FOLDER}/${sanitizedHostname}.png`
}

/**
 * Attempts to find or download a favicon for the given hostname.
 *
 * @param {string} hostname - The hostname for which to find the favicon.
 * @returns {Promise<string|null>} A promise that resolves to the path of the favicon if found or downloaded, or `null` if not found.
 */
export async function MaybeSaveFavicon(hostname: string): Promise<string | null> {
  const quartzPngPath = GetQuartzPath(hostname)
  const localPngPath = path.join(QUARTZ_FOLDER, quartzPngPath)

  // Construct URL for AVIF on assets.turntrout.com
  const assetAvifURL = `https://assets.turntrout.com${quartzPngPath.replace(".png", ".avif")}`

  try {
    // Check if AVIF exists on assets.turntrout.com
    const response = await fetch(assetAvifURL, { method: "HEAD" })
    if (response.ok) {
      return assetAvifURL
    }
  } catch (err) {
    logger.info(`Error checking AVIF on assets.turntrout.com: ${err}`)
  }

  try {
    // Then try local PNG
    await fs.promises.stat(localPngPath)
    return quartzPngPath
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // Neither AVIF nor PNG exists, download as PNG
      const googleFaviconURL = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`
      if (await downloadImage(googleFaviconURL, localPngPath)) {
        return quartzPngPath
      }
    }
    logger.info(`No favicon found for ${hostname}`)
    return null
  }
}

/**
 * Creates an image element (<img>) representing a favicon.
 *
 * @param {string} urlString - The URL of the favicon image.
 * @param {string} [description=''] - An optional description for the favicon.
 * @returns {Object} An object representing the favicon image element.
 */
export const CreateFaviconElement = (urlString: string, description = "") => {
  return {
    type: "element",
    tagName: "img",
    children: [],
    properties: {
      src: urlString,
      class: "favicon",
    },
    alt: description,
  }
}

/**
 * Modifies HTML link (<a>) elements, potentially adding favicons and performing additional cleanup and URL processing.
 *
 * @param {Object} node - The HTML element node (expected to be an <a> tag) to modify.
 */
export const ModifyNode = (node: any) => {
  if (node.tagName === "a") {
    // Remove the "external-icon" elements, hidden anyways
    if (node?.children && node.children.length > 0) {
      node.children = node.children.filter(
        (child: any) => child.properties?.class !== "external-icon",
      )
    }

    let href = node?.properties?.href
    if (href?.startsWith("mailto:")) {
      insertFavicon(MAIL_PATH, node)
      return
    }

    const isInternalBody = href?.startsWith("#")
    if (isInternalBody) {
      node.properties.className.push("same-page-link")
    }

    const notSamePage = !node?.properties?.className?.includes("same-page-link")
    const isAsset = href?.endsWith(".png") || href?.endsWith(".jpg") || href?.endsWith(".jpeg")
    if (notSamePage && !isAsset && href) {
      // Handle before attempting to create URL
      if (href.startsWith("./")) {
        // Relative link
        href = href.slice(2)
        href = "https://www.turntrout.com/" + href
      } else if (href.startsWith("..")) {
        return
      }

      processURL(href)
    }
  }

  async function processURL(href: string) {
    try {
      const finalURL = await followRedirects(new URL(href))

      const imgPath = await MaybeSaveFavicon(finalURL.hostname) // Use the final URL here

      let path
      if (!imgPath) {
        path = "https://assets.turntrout.com/static/images/default_favicon.png" // Set a default favicon if needed
      } else {
        path = imgPath
      }

      insertFavicon(path, node)
    } catch (error) {
      console.error("Error processing URL:", error) // Proper error handling
    }
  }
}

/**
 * Inserts a favicon image element into a given HTML element node.
 *
 * @param {string} imgPath - The path to the favicon image.
 * @param {Object} node - The HTML element node where the favicon should be inserted.
 */
export function insertFavicon(imgPath: any, node: any) {
  if (imgPath !== null) {
    const imgElement = CreateFaviconElement(imgPath)

    const lastChild = node.children[node.children.length - 1]
    if (lastChild && lastChild.type === "text" && lastChild.value) {
      const textContent = lastChild.value
      const charsToRead = Math.min(4, textContent.length)
      const lastFourChars = textContent.slice(-1 * charsToRead)
      lastChild.value = textContent.slice(0, -4)

      // Create a new span
      const span = {
        type: "element",
        tagName: "span",
        children: [
          { type: "text", value: lastFourChars },
          imgElement, // Assuming imgElement is correctly typed
        ],
        properties: {
          style: "white-space: nowrap;",
        },
      }
      node.children.push(span)
    } else {
      node.children.push(imgElement)
    }
  }
}

/**
 * Creates a Rehype plugin that adds favicons to anchor elements in HTML documents.
 *
 * @returns {Object} A Rehype plugin object.
 */
export const AddFavicons = () => {
  return {
    name: "AddFavicons",
    htmlPlugins() {
      return [
        () => {
          return (tree: any) => {
            visit(tree, "element", (node) => {
              ModifyNode(node)
            })
          }
        },
      ]
    },
  }
}
