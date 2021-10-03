import merge from "deepmerge";
import { createBasicConfig } from "@open-wc/building-rollup";
import html from "rollup-plugin-bundle-html-thomzz";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import execute from "rollup-plugin-execute";

const baseConfig = createBasicConfig();

export default merge(baseConfig, {
    input: "./build/index.js",
    output: {
        dir: "dist",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        postcss({
            extract: true,
        }),
        copy({
            targets: [
                { src: "manifest.json", dest: "dist" },
                {
                    src: "./node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
                    dest: "dist",
                },
                {
                    src: "./node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map",
                    dest: "dist",
                },
                { src: "assets", dest: "dist" },
            ],
        }),
        html({
            template: "template.html",
            dest: "dist",
            filename: "index.html",
            externals: [
                { type: "js", file: "browser-polyfill.min.js", pos: "before" },
            ],
            absolute: true,
        }),
        execute(["npx tailwindcss -i ./newtab.css -o ./dist/newtab.css"]),
    ],
});
