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

function resolveCssImports(entryFilePath, visited = new Set()) {
  const normalizedPath = path.resolve(entryFilePath);

  if (visited.has(normalizedPath)) {
    return "";
  }

  visited.add(normalizedPath);

  const css = readFile(normalizedPath);
  const currentDir = path.dirname(normalizedPath);

  return css.replace(
    /@import\s+["'](.+?)["'];?/g,
    (_, importPath) => {
      const resolvedImportPath = path.resolve(currentDir, importPath);

      if (!fs.existsSync(resolvedImportPath)) {
        throw new Error(
          `[build-ui] Arquivo CSS importado não encontrado: ${importPath} (resolvido para ${resolvedImportPath})`
        );
      }

      return resolveCssImports(resolvedImportPath, visited);
    }
  );
}

const htmlTemplate = readFile(srcHtmlPath);
const css = resolveCssImports(srcCssPath);
const js = readFile(builtJsPath);

const finalHtml = htmlTemplate
  .replace("<!-- UI_STYLES -->", `<style>\n${css}\n</style>`)
  .replace("<!-- UI_SCRIPT -->", `<script>\n${js}\n</script>`);

fs.writeFileSync(outputHtmlPath, finalHtml, "utf8");

console.log("[build-ui] ui.html gerado com CSS resolvido e JS inline.");