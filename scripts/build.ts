import { Glob } from "bun";
import { execa } from "execa";
import path from "node:path";
import { mkdir } from "node:fs/promises";

console.log("Starting build process...");

const sourceDir = path.resolve("src");
const outDir = path.resolve("dist");
const templateSource = path.join(sourceDir, "utils", "templates", "default");
const templateDest = path.join(outDir, "templates", "default");

async function build() {
  try {
    console.log("Compiling TypeScript files...");
    await execa("bun", [
      "build",
      path.join(sourceDir, "index.ts"),
      "--outdir",
      outDir,
      "--target",
      "bun",
    ]);
    console.log("TypeScript compiled.");

    console.log("Copying template files...");
    await mkdir(templateDest, { recursive: true });

    const glob = new Glob("**/*");
    for await (const file of glob.scan(templateSource)) {
      const sourcePath = path.join(templateSource, file);
      const destPath = path.join(templateDest, file);

      await mkdir(path.dirname(destPath), { recursive: true });
      await Bun.write(destPath, Bun.file(sourcePath));
    }
    console.log("Template files copied.");
    console.log("\nBuild completed successfully!");
  } catch (error) {
    console.error("\nBuild failed:", error);
    process.exit(1);
  }
}

build();
