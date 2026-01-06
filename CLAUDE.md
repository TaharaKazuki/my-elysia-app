# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Elysia web application running on Bun runtime. Elysia is a TypeScript web framework optimized for Bun.

## Development Commands

**Start development server:**
```bash
bun run dev
```
- Runs with watch mode enabled (automatically restarts on file changes)
- Server runs on http://localhost:3000/

**Install dependencies:**
```bash
bun install
```

**Code Quality:**
```bash
# Format code
bun run format

# Lint code
bun run lint

# Format + Lint + Auto-fix
bun run check

# CI check (no auto-fix)
bun run ci
```

## Architecture

**Runtime & Package Manager:**
- Uses Bun as both the JavaScript runtime and package manager
- All commands should use `bun` instead of `npm` or `yarn`

**Web Framework:**
- Built with Elysia framework
- Main application entry point: [src/index.ts](src/index.ts)
- Routes are defined using Elysia's method chaining API (e.g., `.get("/", handler)`)
- API documentation: `@elysiajs/openapi` plugin with Scalar UI at http://localhost:3000/openapi

**TypeScript Configuration:**
- Uses strict mode type checking
- Target: ES2021
- Module: ES2022 with node resolution
- Bun types are included globally via `types: ["bun-types"]`

**Code Quality Tools:**
- Biome for formatting and linting
- Tab indentation, double quotes
- Auto-organizes imports
- Configuration: [biome.json](biome.json)
