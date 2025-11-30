# Claude Code Configuration for Axolop CRM

## Purpose

This directory contains persistent configuration for Claude Code to ensure that all AI assistant sessions follow the Axolop CRM project rules, regardless of when the session starts.

## Files

### `settings.json`
Contains the system prompt and custom instructions that Claude Code will automatically load when working in this directory.

**Key features:**
- Automatically loads Axolop CRM project rules from `GEMINI.md`
- Enforces all NEVER/ALWAYS rules
- Maintains brand consistency (#101010, #7b1c14)
- Ensures deployment workflow is followed (beta → mastered)
- Preserves tech stack integrity

## How It Works

When Claude Code starts a new session in the `/Users/jdromeroherrera/Desktop/CODE/axolopcrm/website/` directory:

1. **Loads** `.claude/settings.json` automatically
2. **Recalls** memory entities about Axolop CRM guidelines
3. **Applies** all project constraints before responding
4. **Follows** the Decision Framework from GEMINI.md

## Memory System

In addition to this configuration file, Claude Code has saved the following to its persistent memory:

- **Axolop CRM Project Guidelines** (core rules, tech stack, brand colors)
- **Git Branch Strategy** (deployment workflow)
- **Backup Process** (maintenance protocols)
- **Decision Framework** (development principles)
- **File Locations** (codebase references)

## LLM Rules Synchronization

**Source of Truth:** `GEMINI.md`

When updating AI assistant rules:
1. Update `GEMINI.md` first (source of truth)
2. Sync changes to `QWEN.md`
3. Sync changes to `claude.md`
4. Update `.claude/settings.json` if system prompt needs changes

## Maintenance

This configuration should be:
- ✅ **Committed to version control** (tracked in Git)
- ✅ **Synced across team members**
- ✅ **Updated when project rules change**
- ❌ **NOT ignored in .gitignore**

## Benefits

- **Consistency**: Every Claude session follows the same rules
- **Safety**: Project constraints are enforced automatically
- **Efficiency**: No need to re-explain project rules each session
- **Quality**: Maintains luxurious branding and premium standards

---

**Last Updated:** November 16, 2025
**Project:** Axolop CRM v1.0.0-alpha
**Maintainer:** Juan D. Romero Herrera
