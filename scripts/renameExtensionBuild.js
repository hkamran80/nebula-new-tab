const { rename, readFileSync } = require("fs");

const screenshotMode =
    process.argv.length > 2 && process.argv.indexOf("--screenshot-mode") !== -1;

const nebulaRawVersion = JSON.parse(readFileSync("src/manifest.json")).version;

rename(
    `web-ext-artifacts/nebula_new_tab-${nebulaRawVersion}.zip`,
    !screenshotMode ? "web-ext-artifacts/nebula-new-tab.zip" : "web-ext-artifacts/nebula-new-tab-screenshot-mode.zip",
    (error) =>
        error
            ? console.error("Unable to rename ZIP file")
            : console.log("Successfully renamed ZIP file")
);
