import * as path from "path"
import * as fs from "fs"
import { Builder } from "xml2js"

const baseXmlJson = () => ({
    urlset: {
        $: {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
            "xmlns:news": "http://www.google.com/schemas/sitemap-news/0.9",
            "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
            "xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1",
            "xmlns:video": "http://www.google.com/schemas/sitemap-video/1.1",
        },
        url: [] as { loc: string; lastmod: string; changefreq: string; priority: string }[],
    },
})

async function findFiles(baseDir: string, extension: string, prefix = "/"): Promise<string[]> {
    const files: string[] = []

    const filesInDir = fs.readdirSync(baseDir)
    await Promise.all(
        filesInDir.map(async file => {
            const relativeFilePath = path.join(prefix, file)
            const fullFilePath = path.join(baseDir, file)
            const fileStat = fs.statSync(fullFilePath)
            if (fileStat.isDirectory()) {
                await findFiles(fullFilePath, extension, relativeFilePath).then(res => files.push(...res))
            } else if (fileStat.isFile() && file.endsWith(extension)) {
                files.push(relativeFilePath)
            }
        })
    )

    return files
}

type GenerateSitemapParams = {
    hostname: string
    baseDir?: string
    outFile?: string
    keepExtensions?: boolean
    extensions?: string[]
}

export async function generateSitemap({
    hostname,
    baseDir = path.join(process.cwd() + "/dist"),
    outFile = "sitemap.xml",
    keepExtensions = true,
    extensions = ["html"],
}: GenerateSitemapParams) {
    const validatedExtensions = extensions.map(ext => (ext.startsWith(".") ? ext : `.${ext}`))
    const files = (await Promise.all(validatedExtensions.map(async ext => [ext, await findFiles(baseDir, ext)]))) as [string, string[]][]

    const locs = files.flatMap(([ext, files]) => (keepExtensions ? files : files.map(file => file.slice(0, -ext.length))))

    const result = baseXmlJson()
    result.urlset.url = locs.map(loc => ({
        loc: hostname.endsWith("/") ? hostname.slice(0, -1) + loc : hostname + loc,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: "1.0",
    }))

    fs.writeFileSync(path.join(baseDir, outFile), new Builder().buildObject(result))
}
