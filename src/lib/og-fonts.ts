import { readFile } from "node:fs/promises";
import { join } from "node:path";

let fontBoldCache: Buffer | null = null;
let fontRegularCache: Buffer | null = null;

export async function getOgFonts() {
  if (!fontBoldCache) {
    fontBoldCache = await readFile(join(process.cwd(), "assets/SpaceGrotesk-Bold.ttf"));
  }
  if (!fontRegularCache) {
    fontRegularCache = await readFile(join(process.cwd(), "assets/SpaceGrotesk-Regular.ttf"));
  }

  return [
    {
      name: "Space Grotesk",
      data: fontBoldCache,
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      name: "Space Grotesk",
      data: fontRegularCache,
      style: "normal" as const,
      weight: 400 as const,
    },
  ];
}
