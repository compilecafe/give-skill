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
