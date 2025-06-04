import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import type { ProjectConfig, TemplateFile } from "../types";
import {
  PROJECT_DIRECTORIES,
  AUTH_DIRECTORIES,
  HUSKY_DIRECTORIES,
} from "../constants";
import {
  // Base templates
  packageJsonTemplate,
  nextConfigTemplate,
  tsConfigTemplate,
  tailwindConfigTemplate,
  postcssConfigTemplate,
  appLayoutTemplate,
  appPageTemplate,
  globalsCssTemplate,
  envExampleTemplate,
  gitignoreTemplate,
  nvmrcTemplate,
  dbLibTemplate,
  userModelTemplate,
  utilsTemplate,
  typesTemplate,
  helloRouteTemplate,
  readmeTemplate,
  // Auth templates
  authConfigTemplate,
  authRouteTemplate,
  signinButtonTemplate,
  signinPageTemplate,
  dashboardPageTemplate,
  // Husky templates
  preCommitTemplate,
  prePushTemplate,
  lintStagedConfigTemplate,
} from "../templates";

export class ProjectGenerator {
  private config: ProjectConfig;
  private targetDir: string;

  constructor(config: ProjectConfig) {
    this.config = config;
    this.targetDir = config.isCurrentDir
      ? process.cwd()
      : path.join(process.cwd(), config.projectPath);
  }

  async generate(): Promise<void> {
    await this.createDirectories();
    await this.generateFiles();
    await this.setPermissions();
    await this.installDependencies();
    this.showCompletionMessage();
  }

  private async createDirectories(): Promise<void> {
    if (!this.config.isCurrentDir) {
      await fs.ensureDir(this.targetDir);
    }

    console.log(chalk.green(`\n📁 Creating project in ${this.targetDir}\n`));

    const dirs = [...PROJECT_DIRECTORIES];

    if (this.config.addAuth) {
      dirs.push(...AUTH_DIRECTORIES);
    }

    if (this.config.addHusky) {
      dirs.push(...HUSKY_DIRECTORIES);
    }

    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.targetDir, dir));
    }
  }

  private async generateFiles(): Promise<void> {
    const files = this.getTemplateFiles();

    for (const file of files) {
      await fs.writeFile(path.join(this.targetDir, file.path), file.content);
    }

    console.log(chalk.green("✅ Project structure created successfully!\n"));
  }

  private getTemplateFiles(): TemplateFile[] {
    const files: TemplateFile[] = [
      // Base files
      {
        path: "package.json",
        content: JSON.stringify(packageJsonTemplate(this.config), null, 2),
      },
      {
        path: "tsconfig.json",
        content: JSON.stringify(tsConfigTemplate(), null, 2),
      },
      {
        path: "next.config.js",
        content: nextConfigTemplate(),
      },
      {
        path: "tailwind.config.js",
        content: tailwindConfigTemplate(),
      },
      {
        path: "postcss.config.js",
        content: postcssConfigTemplate(),
      },
      {
        path: ".env.local.example",
        content: envExampleTemplate(this.config),
      },
      {
        path: ".env.local",
        content: envExampleTemplate(this.config),
      },
      {
        path: ".gitignore",
        content: gitignoreTemplate(),
      },
      {
        path: ".nvmrc",
        content: nvmrcTemplate(),
      },
      {
        path: "README.md",
        content: readmeTemplate(this.config),
      },
      // App files
      {
        path: "src/app/layout.tsx",
        content: appLayoutTemplate(this.config),
      },
      {
        path: "src/app/page.tsx",
        content: appPageTemplate(),
      },
      {
        path: "src/app/globals.css",
        content: globalsCssTemplate(),
      },
      {
        path: "src/app/api/hello/route.ts",
        content: helloRouteTemplate(),
      },
      // Lib files
      {
        path: "src/lib/db.ts",
        content: dbLibTemplate(),
      },
      {
        path: "src/lib/utils.ts",
        content: utilsTemplate(),
      },
      // Model files
      {
        path: "src/models/User.ts",
        content: userModelTemplate(),
      },
      // Type files
      {
        path: "src/types/index.ts",
        content: typesTemplate(),
      },
    ];

    // Add auth files if needed
    if (this.config.addAuth) {
      files.push(
        {
          path: "src/lib/auth.ts",
          content: authConfigTemplate(),
        },
        {
          path: "src/app/api/auth/[...nextauth]/route.ts",
          content: authRouteTemplate(),
        },
        {
          path: "src/components/auth/signin-button.tsx",
          content: signinButtonTemplate(),
        },
        {
          path: "src/app/(auth)/signin/page.tsx",
          content: signinPageTemplate(),
        },
        {
          path: "src/app/(auth)/dashboard/page.tsx",
          content: dashboardPageTemplate(),
        },
      );
    }

    // Add Husky files if needed
    if (this.config.addHusky) {
      files.push(
        {
          path: ".husky/pre-commit",
          content: preCommitTemplate(),
        },
        {
          path: ".husky/pre-push",
          content: prePushTemplate(),
        },
      );

      // Update package.json with lint-staged config
      const packageJsonFile = files.find((f) => f.path === "package.json");
      if (packageJsonFile) {
        const pkg = JSON.parse(packageJsonFile.content);
        pkg["lint-staged"] = lintStagedConfigTemplate();
        packageJsonFile.content = JSON.stringify(pkg, null, 2);
      }
    }

    return files;
  }

  private async setPermissions(): Promise<void> {
    if (this.config.addHusky) {
      await fs.chmod(path.join(this.targetDir, ".husky/pre-commit"), "755");
      await fs.chmod(path.join(this.targetDir, ".husky/pre-push"), "755");
    }
  }

  private async installDependencies(): Promise<void> {
    if (!this.config.installDeps) return;

    console.log(chalk.blue("📦 Installing dependencies...\n"));

    try {
      const installCmd =
        this.config.packageManager === "bun" ? "bun install" : "pnpm install";

      execSync(installCmd, {
        cwd: this.targetDir,
        stdio: "inherit",
      });

      if (this.config.addHusky) {
        console.log(chalk.blue("🐕 Setting up Husky...\n"));
        execSync(`${this.config.packageManager} run prepare`, {
          cwd: this.targetDir,
          stdio: "inherit",
        });
      }

      console.log(chalk.green("✅ Dependencies installed successfully!\n"));
    } catch (error) {
      console.log(
        chalk.yellow(
          "⚠️  Failed to install dependencies. You can install them manually.\n",
        ),
      );
    }
  }

  private showCompletionMessage(): void {
    console.log(chalk.blue.bold("🎉 Project generated successfully!\n"));

    if (!this.config.isCurrentDir) {
      console.log(chalk.white(`cd ${this.config.projectPath}`));
    }

    if (!this.config.installDeps) {
      console.log(chalk.white(`${this.config.packageManager} install`));
    }

    console.log(chalk.white(`${this.config.packageManager} run dev\n`));

    console.log(chalk.gray("Next steps:"));
    console.log(
      chalk.gray("1. Update .env.local with your MongoDB connection string"),
    );

    if (this.config.addAuth) {
      console.log(
        chalk.gray("2. Configure Google OAuth credentials in .env.local"),
      );
      console.log(
        chalk.gray("3. Visit /api/auth/signin to test authentication"),
      );
    }

    console.log(
      chalk.gray(
        `${this.config.addAuth ? "4" : "2"}. Start building your amazing app! 🚀\n`,
      ),
    );
  }
}
