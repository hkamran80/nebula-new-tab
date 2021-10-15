import merge from "deepmerge";
import { createBasicConfig } from "@open-wc/building-rollup";
import html from "rollup-plugin-bundle-html-thomzz";
import copy from "rollup-plugin-copy";
import execute from "rollup-plugin-execute";
import { terser } from "rollup-plugin-terser";
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
        terser(),
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
                    src: "./node_modules/@popperjs/core/dist/umd/popper.js",
                    dest: "dist",
                },
                {
                    src: "./node_modules/@popperjs/core/dist/umd/popper.js.map",
                    dest: "dist",
                },
                {
                    src: "./node_modules/tippy.js/dist/tippy.umd.js",
                    dest: "dist",
                    rename: "tippy.js",
                },
                {
                    src: "./node_modules/tippy.js/dist/tippy.umd.js.map",
                    dest: "dist",
                    rename: "tippy.js.map",
                    transform: (contents) =>
                        contents.toString().replace("tippy.umd.js", "tippy.js"),
                },
                { src: "./node_modules/tippy.js/dist/tippy.css", dest: "dist" },
                { src: "./node_modules/jquery/dist/jquery.js", dest: "dist" },
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
