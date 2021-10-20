// import { rename, readFileSync } from "fs";
const { rename, readFileSync } = require("fs");

const nebulaRawVersion = JSON.parse(
    readFileSync("src/manifest.json")
).version;

rename(
    `web-ext-artifacts/nebula_new_tab-${nebulaRawVersion}.zip`,
    "web-ext-artifacts/nebula-new-tab.zip",
    (error) =>
        error
            ? console.error("Unable to rename ZIP file")
            : console.log("Successfully renamed ZIP file")
);
