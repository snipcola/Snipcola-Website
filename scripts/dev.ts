import { watch, type WatchEventType } from "fs";
import open from "open";
import { config, build, serve } from "./functions";

const success: boolean = await build(true);
if (!success) console.error("Initial build failed");

serve(config.dev.port);
setTimeout(
  () => open(`http://localhost:${config.dev.port}`),
  config.dev.openTimeout,
);

console.log("Watching for changes");
let building: boolean = false;

watch(
  config.src,
  { recursive: true },
  async function (event: WatchEventType, filename: string | null) {
    if (building || !filename) return;

    building = true;
    console.log(`\n${event.toUpperCase()}: ${filename}`);

    await build(true);
    building = false;
  },
);
