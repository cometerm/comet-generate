#!/usr/bin/env node

import chalk from "chalk";
import { promptUser, ProjectGenerator } from "./utils";

async function main() {
  try {
    const config = await promptUser();
    const generator = new ProjectGenerator(config);
    await generator.generate();
  } catch (error) {
    console.error(chalk.red("❌ Error generating project:"), error);
    process.exit(1);
  }
}

main();
