import { build } from "./utils/functions";

const success: boolean = await build();
if (!success) process.exit(1);
