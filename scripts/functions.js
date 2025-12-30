import Bun from "bun";
import path from "path";
import { rm } from "fs/promises";
import pug from "pug";
import { minify } from "html-minifier-terser";

export const config = {
  src: path.resolve(import.meta.dirname, "..", "src"),
  out: path.resolve(import.meta.dirname, "..", "out"),
  scripts: [
    path.resolve(import.meta.dirname, "..", "src", "scripts", "main.js"),
  ],
  styles: [
    path.resolve(import.meta.dirname, "..", "src", "styles", "main.css"),
  ],
  config: path.resolve(import.meta.dirname, "..", "src", "config.json"),
  pug: path.resolve(import.meta.dirname, "..", "src", "html.pug"),
  result: path.resolve(import.meta.dirname, "..", "out", "index.html"),
  dev: {
    port: 5000,
    openTimeout: 1000,
  },
};

export async function build(dev = false) {
  const start = performance.now();

  if (!dev) {
    await rm(config.out, { recursive: true, force: true });
  }

  let configJSON, jsBuild, cssBuild;

  try {
    configJSON = await Bun.file(config.config).json();
  } catch (error) {
    console.error("Parsing config failed:\n", error);
    return false;
  }

  try {
    jsBuild = await Bun.build({
      entrypoints: config.scripts,
      target: "browser",
      minify: !dev,
    });
  } catch (error) {
    console.error("JavaScript build failed:\n", error);
    return false;
  }

  if (!jsBuild.success) {
    console.error("JavaScript build failed:\n", jsBuild.logs);
    return false;
  }

  try {
    cssBuild = await Bun.build({
      entrypoints: config.styles,
      target: "browser",
      minify: !dev,
    });
  } catch (error) {
    console.error("CSS build failed:\n", error);
    return false;
  }

  if (!cssBuild.success) {
    console.error("CSS build failed:\n", cssBuild.logs);
    return false;
  }

  let html;

  try {
    html = pug.renderFile(config.pug, {
      config: configJSON,
      jsContent: await jsBuild.outputs[0].text(),
      cssContent: await cssBuild.outputs[0].text(),
    });
  } catch (error) {
    console.error("Pug compilation failed:\n", error);
    return false;
  }

  if (!dev) {
    try {
      html = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
      });
    } catch (error) {
      console.error("Minification failed:\n", error);
      return false;
    }
  }

  await Bun.write(config.result, html);

  const end = performance.now();
  console.log(`Built (in ${(end - start).toFixed(2)}ms):`, config.result);

  return true;
}

export function serve(port = 5000) {
  const file = Bun.file(config.result);
  const server = Bun.serve({
    port,
    routes: {
      "/": () => new Response(file),
    },
    fetch: () => Response.redirect("/", 307),
  });

  console.log("Serving:", `http://localhost:${port}`);
  return server;
}
