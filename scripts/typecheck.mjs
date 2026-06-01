import { join } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const tempTsconfigPath = join(projectRoot, "tsconfig.typecheck.json");

const result = spawnSync("npx", ["tsc", "--noEmit", "-p", tempTsconfigPath], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
