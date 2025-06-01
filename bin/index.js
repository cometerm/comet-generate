import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import boxen from "boxen";
import gradient from "gradient-string";
import figlet from "figlet";

const program = new Command();

// Utility functions
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

const showWelcome = () => {
  console.clear();
  const title = figlet.textSync("create-curr", {
    font: "Small",
    horizontalLayout: "fitted",
  });
  console.log(gradient.rainbow(title));
  console.log(
    boxen(
      chalk.white("Fast, modern Next.js project scaffolding tool\n") +
        chalk.gray("Built with love for developers"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "blue",
        textAlignment: "center",
      },
    ),
  );
};

const getProjectConfig = async (projectName) => {
  const questions = [
    {
      type: "input",
      name: "projectName",
      message: "Project name (use '.' for current directory):",
      default: projectName,
      validate: validateProjectName,
      when: !projectName,
    },
    {
      type: "confirm",
      name: "installDependencies",
      message: "Install dependencies?",
      default: true,
    },
    {
      type: "confirm",
      name: "setupShadcn",
      message: "Setup shadcn/ui with button component?",
      default: true,
    },
  ];

  return await inquirer.prompt(questions);
};

async function createProject(config) {
  const finalProjectName = config.projectName || "my-app";
  const isCurrentDir = finalProjectName === ".";
  const projectPath = isCurrentDir
    ? process.cwd()
    : path.resolve(finalProjectName);
  const templatePath = path.join(__dirname, "../templates");

  // Check if directory exists and has files (only for non-current directory)
  if (!isCurrentDir && fs.existsSync(projectPath)) {
    log.error(`Directory ${projectName} already exists!`);
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: "Do you want to overwrite it?",
        default: false,
      },
    ]);

    if (!overwrite) {
      process.exit(1);
    }

    await fs.remove(projectPath);
  }

  // Check if current directory has files when using "."
  if (isCurrentDir) {
    const files = await fs.readdir(projectPath);
    const hasFiles = files.length > 0;

    if (hasFiles) {
      const { proceed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: "Current directory is not empty. Continue anyway?",
          default: false,
        },
      ]);

      if (!proceed) {
        process.exit(1);
      }
    }
  }

  console.log("\n" + chalk.blue("Setting up your project...\n"));

  // Step 1: Create project structure
  const structureSpinner = ora({
    text: "Creating project structure...",
    spinner: "dots12",
  }).start();

  try {
    if (!isCurrentDir) {
      await fs.ensureDir(projectPath);
    }
    await fs.copy(templatePath, projectPath);

    // Update package.json
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

  // Change to project directory
  process.chdir(projectPath);

  // Step 2: Install dependencies (if requested)
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

  // Step 3: Setup shadcn (if requested)
  if (config.setupShadcn && config.installDependencies) {
    const shadcnSpinner = ora({
      text: "Setting up shadcn/ui...",
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

  // Success message
  console.log("\n" + chalk.green("Project created successfully!\n"));

  const nextSteps = [];

  if (!isCurrentDir) {
    nextSteps.push(`cd ${finalProjectName}`);
  }

  nextSteps.push(
    config.installDependencies ? "bun dev" : "bun install && bun dev",
  );

  console.log(
    boxen(
      chalk.white.bold("Next steps:\n\n") +
        nextSteps.map((step, i) => `${i + 1}. ${chalk.cyan(step)}`).join("\n") +
        "\n\n" +
        chalk.gray("Happy coding!"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      },
    ),
  );
}

program
  .name("create-curr")
  .description("Create a fullstack Next.js project with modern tooling")
  .version("1.0.0")
  .argument("[project-name]", "name of the project")
  .option("-y, --yes", "skip prompts and use defaults")
  .option("--no-deps", "skip dependency installation")
  .option("--no-shadcn", "skip shadcn/ui setup")
  .action(async (projectName, options) => {
    // Show welcome screen
    showWelcome();

    // Check prerequisites
    if (!checkPrerequisites()) {
      process.exit(1);
    }

    // Validate project name if provided
    if (projectName) {
      const validation = validateProjectName(projectName);
      if (validation !== true) {
        log.error(validation);
        process.exit(1);
      }
    }

    let config;

    if (options.yes) {
      // Use defaults when --yes flag is used
      config = {
        projectName: projectName || "my-app",
        installDependencies: !options.noDeps,
        setupShadcn: !options.noShadcn,
      };
    } else {
      // Interactive mode
      config = await getProjectConfig(projectName);
    }

    await createProject(config);
  });

program.parse();
