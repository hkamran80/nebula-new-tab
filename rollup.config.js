import merge from "deepmerge";
import { createBasicConfig } from "@open-wc/building-rollup";
import html from "rollup-plugin-bundle-html-thomzz";
import copy from "rollup-plugin-copy";
import execute from "rollup-plugin-execute";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { readFileSync } from "fs";

const baseConfig = createBasicConfig();

export default merge(baseConfig, {
    input: "./build/src/index.js",
    output: {
        dir: "build",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        nodeResolve(),
        copy({
            targets: [
                {
                    src: "src/manifest.json",
                    dest: "dist",
                    transform: (contents) =>
                        contents
                            .toString()
                            .replace(
                                "__NEBULA_VERSION_NAME__",
                                JSON.parse(readFileSync("package.json")).version
                            ),
                },
                {
                    src: "./node_modules/webextension-polyfill/dist/browser-polyfill.js",
                    dest: "dist",
                },
                {
                    src: "./node_modules/webextension-polyfill/dist/browser-polyfill.js.map",
                    dest: "dist",
                },
                {
                    src: "./node_modules/alpinejs/dist/cdn.js",
                    dest: "dist",
                    rename: "alpine.js",
                },
                { src: "assets", dest: "dist" },
                {
                    src: "build/src/index.js",
                    dest: "dist",
                    rename: "z_index.js", // Needed to ensure that tippy.js and popper are imported first
                    transform: (contents) =>
                        contents
                            .toString()
                            .replace(
                                "__NEBULA_VERSION__",
                                JSON.parse(readFileSync("src/manifest.json"))
                                    .version
                            )
                            .replace("// @ts-ignore\n", "")
                            .replace(
                                "const SCREENSHOT_MODE = false;",
                                process.env.SCREENSHOT_MODE === "true"
                                    ? "const SCREENSHOT_MODE = true;"
                                    : "const SCREENSHOT_MODE = false;"
                            ),
                },
            ],
            hook: "generateBundle",
        }),
        html({
            template: "src/template.html",
            dest: "dist",
            filename: "index.html",
            absolute: true,
        }),
        execute([
            "cpy 'build/src/background.js' dist",
            "npx tailwindcss -i ./src/newtab.css -o ./dist/newtab.css",
            "npx prettier --tab-width 4 --write dist/**/*.{js,json,html,css}",
        ]),
    ],
});
