import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const src = path.resolve(__dirname, "..", "src");
export const dist = path.resolve(__dirname, "..", "dist");
export const config = path.resolve(__dirname, "..", "src", "config.json");
