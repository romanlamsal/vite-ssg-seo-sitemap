# vite-ssg-seo-sitemap
Utilities to create a SEO friendly sitemap with vite-ssg.

When using [vite-ssg](https://github.com/antfu/vite-ssg) in conjunction with 
[vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) a typical route config looks like this:

```ts
import generatedRoutes from "~pages"

export const createApp = ViteSSG(
    App,
    { routes: generatedRoutes }
)
```
Your routes to navigate are to become something like:
```
/
/foo
/foo/bar
/bar/baz
```
Generating a sitemap with those paths will NOT lead to the correct pages being crawled by Googlebot etc. 
`curl https://your.website/foo` will be resolved SPA-style, thus not your generated `foo.html` file but your
`index.html` will be served.

This package provides:
- a utility method to add `route.alias`es to your routes pointing to their `foo.html` pendants so `/foo` and `/foo.html` are resolved to the same pages in your app,
- a function to generate a sitemap off your `dist` directory by finding all `.html` files (the extensions are configurable).

Using both will result in the following paths being available
```
/

/foo
/foo.html (resolved like /foo)

/foo/bar
/foo/bar.html (resolved like /foo/bar)

/bar/baz
/bar/baz.html (resolved like /bar/baz)
```

## Usage

Two steps must be taken.

### Step 1: Add `path.alias` to the routes

The package exposes the `extendRoute` utility function for this. It can be used in your `vite.config.(js|ts)` or
`main.ts`.

#### Option a: in vite.config.ts 
```ts
// vite.config.(js|ts)
import Pages from "vite-plugin-pages"
import { generateSitemap, extendRoute } from "vite-ssg-seo-sitemap"

export default defineConfig({
    // your config
    plugins: [
        Pages({
            extendRoute(route) {
                // do what you need to do here
                // but make sure to use the imported extendRoute aswell
                return extendRoute(route)
            }
        })
    ]
})
```

#### Option b: in your main.ts
```ts
import generatedRoutes from "~pages"
import { extendRoute } from "vite-ssg-seo-sitemap"

export const createApp = ViteSSG(
    App,
    { routes: generatedRoutes.map(extendRoute) }
)
```

### Step 2: Actually generate the sitemap on build

```ts
// vite.config.(js|ts)
import Pages from "vite-plugin-pages"
import { generateSitemap, extendRoute } from "vite-ssg-seo-sitemap"

export default defineConfig({
    // your config
    ssgOptions: {
        async onFinished() {
            await generateSitemap({
                hostname: "https://your.website",
            })
        },
    }
})
```


## Configuration

Only `generateSitemap` can be configured with the following parameters.

### hostname
`type: string, required: true`

Your website's full URL, including the scheme.

### baseDir
`type: string, required: false, default: process.cwd() + "/dist"`

Directory to start crawling for files with the given extensions. Should be your directory containing your build,
as the `outFile` will be generated there, too.

### outFile
`type: string, required: false, default: "sitemap.xml"`

Name of the sitemap file to generate. Make sure it's `.xml`.

### keepExtensions
`type: boolean, required: false, default: true`

Configure if you want to disable the extensions of your files in the sitemap.

### extensions
`type: string[], required: false, default: ["html"]`

Extensions to crawl. If you want to include non-`html` files in your sitemap, this is your paremeter.
A `.` will be automatically prepended for you if omitted here.