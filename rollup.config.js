import merge from "deepmerge";
import { createBasicConfig } from "@open-wc/building-rollup";
import html from "rollup-plugin-bundle-html-thomzz";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import execute from "rollup-plugin-execute";
import { terser } from "rollup-plugin-terser";

const baseConfig = createBasicConfig();

export default merge(baseConfig, {
    input: "./build/src/index.js",
    output: {
        dir: "build",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        postcss({
            extract: true,
        }),
        copy({
            targets: [
                { src: "build/src/index.js", dest: "dist" },
                { src: "src/manifest.json", dest: "dist" },
                {
                    src: "./node_modules/webextension-polyfill/dist/browser-polyfill.js",
                    dest: "dist",
                },
                {
                    src: "./node_modules/webextension-polyfill/dist/browser-polyfill.js.map",
                    dest: "dist",
                },
                { src: "assets", dest: "dist" },
            ],
        }),
        html({
            template: "src/template.html",
            dest: "dist",
            filename: "index.html",
            externals: [
                { type: "js", file: "browser-polyfill.js", pos: "before" },
                { type: "js", file: "index.js", pos: "after" },
            ],
            absolute: true,
        }),
        terser(),
        execute([
            "npx tailwindcss -i ./src/newtab.css -o ./dist/newtab.css",
            "npx prettier --tab-width 4 --write dist/**/*.{js,json,html,css}"
        ]),
    ],
});
