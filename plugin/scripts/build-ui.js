const fs = require("fs");
const path = require("path");

const root = process.cwd();

const srcHtmlPath = path.join(root, "src", "ui.html");
const srcCssPath = path.join(root, "src", "ui.css");
const builtJsPath = path.join(root, "dist", "ui.js");
const outputHtmlPath = path.join(root, "ui.html");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

const htmlTemplate = readFile(srcHtmlPath);
const css = readFile(srcCssPath);
const js = readFile(builtJsPath);

const finalHtml = htmlTemplate
  .replace("<!-- UI_STYLES -->", `<style>\n${css}\n</style>`)
  .replace("<!-- UI_SCRIPT -->", `<script>\n${js}\n</script>`);

fs.writeFileSync(outputHtmlPath, finalHtml, "utf8");

console.log("[build-ui] ui.html gerado com CSS e JS inline.");