# CLAUDE.md

Project-specific instructions and preferences for Claude Code.

---

## Languages & Stack

Primary languages and platforms used across projects:

- **TypeScript / JavaScript** — Node.js, browser, and full-stack (e.g. React, Next.js)
- **Swift / iOS** — Native Apple platform development (UIKit, SwiftUI)
- Other languages may appear on a per-project basis

---

## Coding Style

- Prefer clarity over cleverness — readable code beats clever one-liners
- Use the conventions already established in the file being edited (indentation, naming, formatting)
- Avoid unnecessary abstractions; solve the problem at hand
- Delete unused code rather than commenting it out
- Do not add docstrings, comments, or type annotations to code that wasn't changed

### TypeScript / JavaScript
- Prefer `const` over `let`; avoid `var`
- Use `async/await` over raw promise chains
- Explicit types preferred over `any`

### Swift
- Follow Swift API Design Guidelines
- Prefer value types (`struct`) over reference types (`class`) where appropriate
- Use Swift concurrency (`async/await`, `Task`) over completion handlers

---

## Workflow Rules

- **Read before modifying** — always read a file before editing it
- **Minimal changes** — only change what is needed for the task; do not refactor surrounding code unless asked
- **No speculative features** — do not add functionality that wasn't requested
- **No backwards-compat shims** — remove unused code entirely instead of keeping dead paths
- **Security** — never introduce XSS, injection, or other OWASP top-10 vulnerabilities

### Commits

No strict format required. Write commit messages that clearly describe *what* changed and *why* when the reason isn't obvious.

### Tests

Write or update tests when explicitly asked, or when a change clearly requires it. Run existing tests after changes where applicable.

---

## Project Context

> **TODO:** Add project-specific notes here (architecture overview, key directories, important conventions, third-party services, environment setup, etc.)

---

## Notes

> **TODO:** Any other preferences, tools, or rules to add over time.
