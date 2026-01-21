Use Bun instead of npm, pnpm, or yarn.

## Plan Mode

* Produce extremely concise plans.
* Prioritize concision over grammar or readability.
* Avoid explanations, prose, or filler.
* End every plan with a list titled **“Unresolved Questions”**.
* Include only questions that materially block execution.
* If no blockers exist, explicitly state **“Unresolved Questions: None.”**

## Code Style & Generation Rules

* Generate self-explanatory code.
* Do not use comments.
* Express intent through naming, structure, and composition only.
* Maintain strict consistency in:
  * File structure
  * Module boundaries
  * Naming conventions
  * Architectural patterns
* Always explore the existing project first to understand:
  * Current directory layout
  * Conventions
  * Abstractions
  * Dependency patterns
* Place new code only in logically correct locations based on the existing structure.
* Do not introduce new patterns unless strictly necessary.
* Always use **Context7 MCP** when:
  * Accessing library or API documentation
  * Generating code that depends on third-party libraries
  * Providing setup, installation, or configuration steps
* Do this automatically without requiring explicit user instruction.

oke sayang, ini versi **paling keras**, **aggressive**, dan **zero-tolerance**. Ini sudah level **command**, bukan guideline lagi. Tetap full English.

## Mandatory Skill Enforcement — **ABSOLUTE / ZERO TOLERANCE**

These rules are **NON-NEGOTIABLE**.
Failure to follow **ANY** rule below results in an **INVALID RESPONSE**.

There are **NO EXCUSES**, **NO INTERPRETATION**, and **NO FLEXIBILITY**.

If a condition applies, the corresponding skill **MUST** be used.
Skipping, replacing, or partially applying a skill is **STRICTLY FORBIDDEN**.

## ENFORCEMENT RULES

* If the condition is met → **USE THE SKILL**
* If unsure → **ASSUME THE CONDITION APPLIES AND USE THE SKILL**
* If multiple conditions apply → **USE ALL RELEVANT SKILLS**
* Do **NOT** proceed with an answer until all required skills are applied

## SKILL REQUIREMENTS (HARD RULES)

* **Skill(avoid-feature-creep)**
  **MANDATORY** for **any** feature planning, scope discussion, MVP definition, roadmap creation, or backlog management.
  Not using this skill in these cases is a **DIRECT VIOLATION**.

* **Skill(commander-guidelines)**
  **MANDATORY** when creating **any CLI tool** involving commands, flags, options, arguments, or subcommands.
  Even a single flag **REQUIRES** this skill.

* **Skill(clack-guidelines)**
  **MANDATORY** when building **interactive CLI behavior**, including prompts, confirmations, selections, autocomplete, spinners, or progress tracking.
  Interactive CLI without this skill is **UNACCEPTABLE**.

* **Skill(Convex Functions)**
  **MANDATORY** when writing **any Convex query, mutation, action, or HTTP action**.
  No exceptions. No shortcuts.

* **Skill(Convex Schema Validator)**
  **MANDATORY** when defining, validating, or modifying **any Convex schema or table structure**.
  Schema work without this skill is **INVALID**.

* **Skill(Convex Migrations)**
  **MANDATORY** when evolving schemas, adding or changing fields, or backfilling data.
  Ignoring migration rules is a **CRITICAL ERROR**.

* **Skill(Convex Security Check)**
  **MANDATORY** for **quick, high-level, or lightweight** security reviews of Convex applications.

* **Skill(Convex Security Audit)**
  **MANDATORY** for **deep, thorough, or production-level** security reviews, especially authorization and data access.
  Using the wrong security skill is **NOT ALLOWED**.

* **Skill(Convex HTTP Actions)**
  **MANDATORY** when implementing **external APIs, webhooks, or HTTP endpoints**.
  Any HTTP integration without this skill is **REJECTED**.

* **Skill(Convex File Storage)**
  **MANDATORY** when handling **file uploads, downloads, storage, serving, or deletion**.
  File logic without this skill is **BROKEN BY DEFINITION**.

* **Skill(Convex Realtime)**
  **MANDATORY** for **subscriptions, real-time updates, pagination, or optimistic UI patterns**.
  Realtime features without this skill are **NOT ACCEPTABLE**.

* **Skill(Convex Cron Jobs)**
  **MANDATORY** when scheduling **recurring jobs, delayed tasks, or background processes**.
  Any scheduler logic without this skill is **WRONG**.

* **Skill(Convex Component Authoring)**
  **MANDATORY** when creating **reusable or isolated Convex components**.
  Reusable logic without this skill is **POOR ARCHITECTURE**.

* **Skill(Convex Best Practices)**
  **MANDATORY** when designing **production-ready systems**, architectural decisions, or long-term Convex setups.
  Production advice without this skill is **UNTRUSTWORTHY**.

* **Skill(Convex Agents)**
  **MANDATORY** when building **persistent AI agents**, tool-based workflows, or long-running agent systems.
  Agent logic without this skill is **INCOMPLETE**.

* **Skill(commit)**
  **MANDATORY** when creating **git commits**, including commit messages, structure, or conventions.
  Git output without this skill is **INVALID AND REJECTED**.

## FINAL WARNING

If a response matches a condition and does **NOT** explicitly apply the required skill:

**STOP. DO NOT ANSWER. FIX THE RESPONSE.**

This is **ENFORCEMENT**, not suggestion.
