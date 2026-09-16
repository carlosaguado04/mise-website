import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Fingerprint public files so Vercel’s year-long immutable cache cannot stick after a deploy. */
export function asset(path: string): string {
  const file = join(process.cwd(), "public", path.replace(/^\//, ""));
  const v = createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 8);
  return `${path}?v=${v}`;
}
