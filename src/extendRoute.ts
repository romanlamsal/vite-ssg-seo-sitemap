import { RouteRecordRaw } from "vue-router"

export function extendRoute(route: RouteRecordRaw) {
    if (route.path === "/") {
        return route
    }

    let alias = route.alias

    if (!route.path.includes(".")) {
        let htmlAlias: string
        if (route.path.endsWith("/")) {
            htmlAlias = route.path.slice(0, -1) + ".html"
        } else {
            htmlAlias = route.path + ".html"
        }
        if (Array.isArray(alias)) {
            alias.push(htmlAlias)
        } else if (alias !== undefined) {
            alias = [alias, htmlAlias]
        } else {
            alias = htmlAlias
        }
    }

    return {
        ...route,
        alias,
    }
}
