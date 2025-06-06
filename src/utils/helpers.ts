import figlet from "figlet";
import pc from "picocolors";
import { execa } from "execa";
import ora, { type Spinner } from "ora";
import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import type { ProjectOptions, ProjectResult } from "../types";
import prompts from "prompts";

const oraSpinnerConfig: Spinner = {
  interval: 200,
  frames: ["◉", "◎"],
};

export function displayBanner() {
  try {
    const text = figlet.textSync("comet", { font: "Rowan Cap" });
    console.log("\n" + pc.magenta(text));
  } catch (error) {
    console.log("\n" + pc.magenta("comet") + "\n" + pc.magenta("========"));
  }
}

function logError(message: string, error?: unknown) {
  console.error(pc.red(`\nError: ${message}`));
  if (error instanceof Error) {
    console.error(pc.white(error.message));
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  return await Bun.file(filePath).exists();
}

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

async function emptyDir(dirPath: string): Promise<void> {
  await rm(dirPath, { recursive: true, force: true });
  await ensureDir(dirPath);
}

async function copyTemplate(
  templatePath: string,
  projectPath: string,
  projectName: string,
): Promise<void> {
  const spinner = ora({
    text: "Setting up project files...",
    spinner: oraSpinnerConfig,
  }).start();

  try {
    const templateFiles = await Array.fromAsync(
      new Bun.Glob("**/*").scan({ cwd: templatePath, dot: true }),
    );

    for (const file of templateFiles) {
      const sourcePath = path.join(templatePath, file);
      const destPath = path.join(projectPath, file);

      await ensureDir(path.dirname(destPath));

      const sourceFile = Bun.file(sourcePath);

      if (file === "package.json") {
        const pkgContent = await sourceFile.json();
        pkgContent.name = projectName;
        await Bun.write(destPath, JSON.stringify(pkgContent, null, 2));
      } else {
        await Bun.write(destPath, sourceFile);
      }
    }

    spinner.succeed("Project files were set up.");
  } catch (error) {
    spinner.fail("Failed to set up project files.");
    throw error;
  }
}

async function initializeGit(projectPath: string): Promise<boolean> {
  const spinner = ora({
    text: "Initializing git repository...",
    spinner: oraSpinnerConfig,
  }).start();
  try {
    await execa("git", ["init"], { cwd: projectPath });
    spinner.succeed("Git repository initialized.");
    return true;
  } catch (error) {
    spinner.fail("Failed to initialize git repository. Is git installed?");
    logError("Could not initialize git repository.", error);
    return false;
  }
}

async function installDependencies(projectPath: string): Promise<boolean> {
  const spinner = ora({
    text: "Installing dependencies...",
    spinner: oraSpinnerConfig,
  }).start();
  try {
    await execa("bun", ["install"], { cwd: projectPath });
    spinner.succeed("Dependencies installed.");
    return true;
  } catch (error) {
    spinner.fail("Failed to install dependencies.");
    logError("Dependency installation failed.", error);
    console.log(pc.white("You can try running 'bun install' manually."));
    return false;
  }
}

export async function createProject(
  projectDirectory: string,
  options: ProjectOptions,
): Promise<ProjectResult | null> {
  let projectName = projectDirectory;

  if (!projectName) {
    if (options.yes) {
      projectName = "comet-app";
    } else {
      const response = await prompts({
        type: "text",
        name: "value",
        message: "Path to your project or name?",
        initial: "comet-app",
      });
      if (!response.value) return null;
      projectName = response.value;
    }
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  if (await pathExists(projectPath)) {
    const isDirectoryEmpty =
      (await Array.fromAsync(new Bun.Glob("*").scan(projectPath))).length === 0;
    if (!isDirectoryEmpty && !options.yes) {
      const { value: overwrite } = await prompts({
        type: "confirm",
        name: "value",
        message: `Directory "${projectName}" is not empty. Overwrite it?`,
        initial: false,
      });
      if (!overwrite) return null;
      await emptyDir(projectPath);
    }
  }
  await ensureDir(projectPath);

  try {
    const templatePath = path.join(
      import.meta.dir,
      "utils",
      "templates",
      "default",
    );
    await copyTemplate(templatePath, projectPath, projectName);
  } catch (error) {
    logError("Could not create project.", error);
    return null;
  }

  let gitInitialized = false;
  if (
    options.yes ||
    (
      await prompts({
        type: "confirm",
        name: "value",
        message: "Initialize a git repository?",
        initial: true,
      })
    ).value
  ) {
    gitInitialized = await initializeGit(projectPath);
  }

  let dependenciesInstalled = false;
  if (
    options.yes ||
    (
      await prompts({
        type: "confirm",
        name: "value",
        message: "Install dependencies?",
        initial: true,
      })
    ).value
  ) {
    dependenciesInstalled = await installDependencies(projectPath);
  }

  return {
    projectName,
    gitInitialized,
    dependenciesInstalled,
    template: "default",
  };
}
