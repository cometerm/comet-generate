import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";

ora.prototype.succeed = function (text) {
  this.stopAndPersist({
    symbol: chalk.green("●"),
    text: text || this.text,
  });
  return this;
};

ora.prototype.fail = function (text) {
  this.stopAndPersist({
    symbol: chalk.red("●"),
    text: text || this.text,
  });
  return this;
};

ora.prototype.warn = function (text) {
  this.stopAndPersist({
    symbol: chalk.yellow("●"),
    text: text || this.text,
  });
  return this;
};

const log = {
  info: (msg) => console.log(chalk.blue("●"), msg),
  success: (msg) => console.log(chalk.green("●"), msg),
  error: (msg) => console.log(chalk.red("●"), msg),
  warn: (msg) => console.log(chalk.yellow("●"), msg),
};

const validateProjectName = (name) => {
  if (name === ".") return true;
  const validNameRegex = /^[a-zA-Z0-9-_]+$/;
  if (!validNameRegex.test(name)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores";
  }
  if (name.length < 1) return "Project name cannot be empty";
  if (name.length > 50) return "Project name is too long";
  return true;
};

const checkPrerequisites = () => {
  try {
    execSync("bun --version", { stdio: "pipe" });
    return true;
  } catch {
    log.error("Bun is not installed. Please install Bun first.");
    console.log(
      chalk.yellow(
        "Visit: https://bun.sh/docs/installation for installation guide",
      ),
    );
    return false;
  }
};

const cleanup = async (projectPath) => {
  try {
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath);
      log.info("Cleaned up incomplete project");
    }
  } catch (error) {
    log.warn("Could not clean up project directory");
  }
};

const askYesNo = async (message, def = true) => {
  const defStr = def ? "Y/n" : "y/N";
  const { answer } = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message: `${message} (${defStr})`,
      filter: (input) => input.trim().toLowerCase(),
      validate: (input) => {
        if (!input && typeof def === "boolean") return true;
        if (["y", "yes", "n", "no"].includes(input)) return true;
        return "Please answer yes or no";
      },
    },
  ]);

  let result;
  if (!answer && typeof def === "boolean") {
    result = def;
  } else {
    result = ["y", "yes"].includes(answer);
  }

  if (result) {
    console.log(chalk.green("●"), message, chalk.gray("Yes"));
  } else {
    console.log(chalk.red("●"), message, chalk.gray("No"));
  }

  return result;
};

const getProjectConfig = async (projectName) => {
  let config = {};

  if (!projectName) {
    while (true) {
      const { projectName: name } = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "Project name (use '.' for current directory):",
          default: "my-app",
        },
      ]);

      const valid = validateProjectName(name);
      if (valid === true) {
        console.log(chalk.green("●"), "Project name:", chalk.gray(name));
        config.projectName = name;
        break;
      } else {
        console.log(chalk.red("●"), valid);
      }
    }
  } else {
    config.projectName = projectName;
  }

  config.installDependencies = await askYesNo("Install dependencies?", true);

  config.setupShadcn = await askYesNo(
    "Setup shadcn/ui with button component?",
    true,
  );

  return config;
};

async function createProject(config) {
  const finalProjectName = config.projectName || "my-app";
  const isCurrentDir = finalProjectName === ".";
  const projectPath = isCurrentDir
    ? process.cwd()
    : path.resolve(finalProjectName);
  const templatePath = path.join(__dirname, "../templates");

  if (!isCurrentDir && fs.existsSync(projectPath)) {
    log.error(`Directory ${finalProjectName} already exists!`);
    const overwrite = await askYesNo("Do you want to overwrite it?", false);
    if (!overwrite) {
      process.exit(1);
    }
    await fs.remove(projectPath);
  }

  if (isCurrentDir) {
    const files = await fs.readdir(projectPath);
    const hasFiles = files.length > 0;
    if (hasFiles) {
      const proceed = await askYesNo(
        "Current directory is not empty. Continue anyway?",
        false,
      );
      if (!proceed) {
        process.exit(1);
      }
    }
  }

  console.log("\n" + chalk.blue("Setting up your project...\n"));

  const structureSpinner = ora({
    text: "Creating project structure...",
    spinner: "dots12",
  }).start();

  try {
    if (!isCurrentDir) {
      await fs.ensureDir(projectPath);
    }
    await fs.copy(templatePath, projectPath);

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = isCurrentDir
      ? path.basename(projectPath)
      : finalProjectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    structureSpinner.succeed("Project structure created");
  } catch (error) {
    structureSpinner.fail("Failed to create project structure");
    if (!isCurrentDir) {
      await cleanup(projectPath);
    }
    log.error(error.message);
    process.exit(1);
  }

  process.chdir(projectPath);

  if (config.installDependencies) {
    const installSpinner = ora({
      text: "Installing dependencies with Bun...",
      spinner: "bouncingBar",
    }).start();

    try {
      execSync("bun install", { stdio: "pipe" });
      installSpinner.succeed("Dependencies installed");
    } catch (error) {
      installSpinner.fail("Failed to install dependencies");
      if (!isCurrentDir) {
        await cleanup(projectPath);
      }
      log.error("You can install dependencies later with: bun install");
      process.exit(1);
    }
  }

  if (config.setupShadcn && config.installDependencies) {
    const shadcnSpinner = ora({
      text: "Setting up shadcn...",
      spinner: "earth",
    }).start();

    try {
      execSync("bunx shadcn@latest init --yes", { stdio: "pipe" });
      execSync("bunx shadcn@latest add button", { stdio: "pipe" });
      shadcnSpinner.succeed("shadcn/ui configured with button component");
    } catch (error) {
      shadcnSpinner.warn("shadcn setup completed with warnings");
    }
  }

  console.log("\n" + chalk.green("Project created successfully!\n"));

  const nextSteps = [];
  if (!isCurrentDir) {
    nextSteps.push(`cd ${finalProjectName}`);
  }
  nextSteps.push(
    config.installDependencies ? "bun dev" : "bun install && bun dev",
  );

  console.log(chalk.bold("Next steps:"));
  nextSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${chalk.cyan(step)}`);
  });
}

const program = new Command();

program
  .name("create-curr")
  .description("Create a fullstack Next.js project with modern tooling")
  .version("1.0.0")
  .argument("[project-name]", "name of the project")
  .option("-y, --yes", "skip prompts and use defaults")
  .option("--no-deps", "skip dependency installation")
  .option("--no-shadcn", "skip shadcn/ui setup")
  .action(async (projectName, options) => {
    if (!checkPrerequisites()) {
      process.exit(1);
    }

    if (projectName) {
      const validation = validateProjectName(projectName);
      if (validation !== true) {
        log.error(validation);
        process.exit(1);
      }
    }

    let config;

    if (options.yes) {
      config = {
        projectName: projectName || "my-app",
        installDependencies: !options.noDeps,
        setupShadcn: !options.noShadcn,
      };
    } else {
      config = await getProjectConfig(projectName);
    }

    await createProject(config);
  });

program.parse();
