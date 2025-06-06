# Comet Generator

Forget the boring setup. Comet gets your new project ready to go by asking a few simple questions. It handles all the annoying first steps: making the project folder, firing up a new git repo, and grabbing your dependencies with bun.

## Quick Start

Create a new project with a single command. For the fastest experience, we highly recommend using **Bun**.

```bash
# Using Bun (Recommended & Fastest)
bun create comet@latest

# Using pnpm
pnpm create comet@latest

# Using npm
npx create-comet@latest # absolute incels will use use this
```

## Prerequisites

The commands above require **Bun** or **pnpm** to be installed. If you don't have them yet, you can add them with the following commands.

### Install Bun

```bash
npm install -g bun # The last npm command you'll ever need
```

### Install pnpm

```bash
npm install -g pnpm@latest-10
```

## Demonstration

Here's what it looks like to generate a new project:

```text
❯ bunx create-comet@latest

   .aMMMb  .aMMMb  dMMMMMMMMb dMMMMMP dMMMMMMP
  dMP"VMP dMP"dMP dMP"dMP"dMPdMP        dMP
 dMP     dMP dMP dMP dMP dMPdMMMP      dMP
dMP.aMP dMP.aMP dMP dMP dMPdMP        dMP
VMMMP"  VMMMP" dMP dMP dMPdMMMMMP    dMP

? Path to your project or name? » comet-app
✔ Project files were set up.
? Initialize a git repository? » (Y/n)
✔ Git repository initialized.
? Install dependencies? » (Y/n)
◉ Installing dependencies...
✔ Dependencies installed.
    - cd comet-app
    - bun dev

    - Update database connection string in .env.local
    - Start building API in src/app/api
    - Create database models in src/models
```
