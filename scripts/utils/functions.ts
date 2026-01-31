import Bun, { type BuildOutput, type BunFile, type Server } from "bun";
import path from "path";
import { rm } from "fs/promises";
import pug from "pug";
import { minify } from "html-minifier-terser";
import { type SiteConfig, SiteConfigSchema } from "../config/schema";
import z, { ZodError } from "zod";

type ConfigDev = {
  port: number;
  openTimeout: number;
};

type Config = {
  src: string;
  out: string;
  scripts: Array<string>;
  styles: Array<string>;
  config: string;
  pug: string;
  result: string;
  dev: ConfigDev;
};

const rootDirectory: string = path.resolve(import.meta.dirname, "..", "..");
export const config: Config = {
  src: path.resolve(rootDirectory, "src"),
  out: path.resolve(rootDirectory, "out"),
  scripts: [path.resolve(rootDirectory, "src", "scripts", "main.ts")],
  styles: [path.resolve(rootDirectory, "src", "styles", "main.css")],
  config: path.resolve(rootDirectory, "src", "config.json"),
  pug: path.resolve(rootDirectory, "src", "html.pug"),
  result: path.resolve(rootDirectory, "out", "index.html"),
  dev: {
    port: 5000,
    openTimeout: 1000,
  },
};

export async function build(dev: boolean = false): Promise<boolean> {
  const start: number = performance.now();

  if (!dev) {
    await rm(config.out, { recursive: true, force: true });
  }

  let configJSON: SiteConfig, jsBuild: BuildOutput, cssBuild: BuildOutput;

  try {
    const data: unknown = await Bun.file(config.config).json();
    configJSON = SiteConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Config validation failed:\n", z.prettifyError(error));
    } else {
      console.error("Parsing config failed:\n", error);
    }

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

  let html: string;

  try {
    html = pug.renderFile(config.pug, {
      config: configJSON,
      jsContent: await jsBuild.outputs[0]?.text(),
      cssContent: await cssBuild.outputs[0]?.text(),
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

  const end: number = performance.now();
  console.log(`Built (in ${(end - start).toFixed(2)}ms):`, config.result);

  return true;
}

export function serve(port: number = 5000): Server<undefined> {
  const file: BunFile = Bun.file(config.result);
  const server: Server<undefined> = Bun.serve({
    port,
    routes: {
      "/": () => new Response(file),
    },
    fetch: () => Response.redirect("/", 307),
  });

  console.log("Serving:", `http://localhost:${port}`);
  return server;
}
