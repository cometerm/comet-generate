import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

const program = new Command();

program
  .name("create-curr")
  .description("Create a fullstack Next.js project with some boilerplate")
  .version("1.0.0")
  .argument("[project-name]", "name of the project")
  .action(async (projectName) => {
    if (!projectName) {
      console.log(chalk.red("Please provide a project name"));
      console.log(chalk.yellow("Usage: bunx create-curr@latest my-app"));
      process.exit(1);
    }

    await createProject(projectName);
  });

async function createProject(projectName) {
  const projectPath = path.resolve(projectName);
  const templatePath = path.join(__dirname, "../templates");

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Directory ${projectName} already exists!`));
    process.exit(1);
  }

  console.log(chalk.blue(`Creating ${projectName}...`));

  const spinner = ora("Setting up project structure...").start();
  try {
    await fs.ensureDir(projectPath);
    await fs.copy(templatePath, projectPath);

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    spinner.succeed("Project structure created");
  } catch (error) {
    spinner.fail("Failed to create project structure");
    console.error(error);
    process.exit(1);
  }

  const installSpinner = ora("Installing dependencies with Bun...").start();
  try {
    process.chdir(projectPath);
    execSync("bun install", { stdio: "pipe" });
    installSpinner.succeed("Dependencies installed");
  } catch (error) {
    installSpinner.fail("Failed to install dependencies");
    console.error(error);
    process.exit(1);
  }

  const shadcnSpinner = ora("Setting up shadcn...").start();
  try {
    execSync("bunx shadcn@latest init --yes", { stdio: "pipe" });
    execSync("bunx shadcn@latest add button input card", { stdio: "pipe" });
    shadcnSpinner.succeed("shadcn/ui configured!");
  } catch (error) {
    shadcnSpinner.warn(
      "shadcn setup completed (some components may need manual setup)",
    );
  }

  console.log(chalk.green("\nProject created"));
  console.log(chalk.yellow("\nNext steps:"));
  console.log(`  cd ${projectName}`);
  console.log("  bun dev");
}

program.parse();
