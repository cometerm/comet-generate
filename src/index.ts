#!/usr/bin/env bun
// @ts-ignore: Shebang line

import { program } from "commander";
import pc from "picocolors";
import { createProject, displayBanner } from "./utils/helpers";

program
  .name("create-comet")
  .description("Create a modern Next.js application")
  .argument("[project-directory]", "Directory to create the project in")
  .option("-y, --yes", "Skip all confirmation prompts", false)
  .action(async (projectDirectory, options) => {
    try {
      displayBanner();
      const result = await createProject(projectDirectory, options);

      if (result) {
        console.log(pc.white(`    - cd ${result.projectName}`));

        if (!result.dependenciesInstalled) {
          console.log(pc.white("    - bun install"));
        }

        console.log(pc.white("    - bun dev"));

        console.log(
          "\n" +
            pc.white("    - Update database connection string in .env.local"),
        );
        console.log(pc.white("    - Start building API in src/app/api"));
        console.log(pc.white("    - Create database models in src/models"));
        process.exit(0);
      }
    } catch (err) {
      process.exit(1);
    }
  });

program.parse();
