# create-curr

Fast, modern Next.js project scaffolding tool built for Bun.

## Installation

```bash
bunx create-curr@latest
```

## Usage

```bash
# Interactive mode
bunx create-curr my-app

# Use current directory
bunx create-curr .

# Skip prompts with defaults
bunx create-curr my-app --yes

# Custom options
bunx create-curr my-app --no-deps --no-shadcn
```

## Options

- `--yes, -y` - Skip prompts and use defaults
- `--no-deps` - Skip dependency installation
- `--no-shadcn` - Skip shadcn setup