import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import type { ProjectConfig } from "../types";

export async function promptUser(): Promise<ProjectConfig> {
  console.log(
    chalk.blue.bold("🚀 Welcome to Comet CLI - Next.js Project Generator\n"),
  );

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectPath",
      message: "Project name or path?",
      default: "demo",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Please provide a project name or path";
        }
        return true;
      },
    },
    {
      type: "confirm",
      name: "addAuth",
      message: "Add authentication layer? (NextAuth with Google)",
      default: false,
    },
    {
      type: "confirm",
      name: "addHusky",
      message: "Add Husky for git hooks?",
      default: false,
    },
    {
      type: "list",
      name: "packageManager",
      message: "Package manager?",
      choices: ["bun", "pnpm"],
      default: "bun",
    },
    {
      type: "confirm",
      name: "installDeps",
      message: "Install dependencies?",
      default: true,
    },
  ]);

  const isCurrentDir = answers.projectPath === ".";
  const projectName = isCurrentDir
    ? path.basename(process.cwd())
    : answers.projectPath;

  return {
    projectName,
    projectPath: answers.projectPath,
    isCurrentDir,
    addAuth: answers.addAuth,
    addHusky: answers.addHusky,
    packageManager: answers.packageManager,
    installDeps: answers.installDeps,
  };
}
