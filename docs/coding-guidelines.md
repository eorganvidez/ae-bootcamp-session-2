# Coding Guidelines

This project should be implemented with a consistent, readable, and maintainable coding style across both the frontend and backend. The goal is not just to make the code work, but to keep it easy to understand, test, extend, and review as the TODO application grows.

Code should favor clarity over cleverness. Small, direct functions and components are preferred over dense abstractions that save a few lines at the cost of readability. When a piece of logic feels difficult to explain, it should usually be simplified before it is merged. Names should be descriptive and should make the role of a variable, function, component, or module obvious without extra comments.

Formatting should remain consistent throughout the codebase. Files should use the existing project conventions for indentation, spacing, quotes, and semicolon usage rather than mixing styles. Lines should stay reasonably compact, blocks of related code should be grouped together, and unnecessary whitespace noise should be avoided. Large files should be split when responsibilities start to blur.

Imports should be organized in a predictable order so files are easy to scan. Third-party dependencies should appear before local imports, and related imports should be grouped together. Unused imports should be removed promptly. Import style should remain consistent within a file and across the project so that dependencies are easy to locate during maintenance.

Linting should be treated as part of the development workflow, not as an afterthought. Developers should use the project linter and address warnings and errors introduced by their changes before code is considered complete. If a lint rule appears to conflict with a legitimate implementation need, the code should first be reconsidered before suppressing the rule. Exceptions should be rare and should be easy to justify.

The codebase should follow the DRY principle, but not by forcing premature abstraction. Repeated logic should be extracted when the duplication represents the same behavior and is likely to evolve together. At the same time, unrelated concerns should not be combined just to avoid a small amount of repetition. Shared utilities, helpers, and reusable UI pieces should be introduced when they make the code simpler overall.

Functions and components should have a single clear responsibility. Business logic should be kept separate from presentation concerns when practical, and modules should expose focused interfaces instead of broad, ambiguous behavior. On the frontend, components should remain easy to reason about and should avoid mixing rendering, data access, and transformation logic in one place. On the backend, route handlers should stay thin where possible, with validation and business rules moved into dedicated logic.

Error handling should be explicit and consistent. Inputs should be validated close to the boundary where data enters the system, and failure cases should be handled intentionally instead of being left to implicit runtime errors. User-facing failures should produce helpful, plain-language feedback, while developer-facing errors should remain easy to trace and debug.

Comments should be used sparingly. Code should normally explain itself through structure and naming. Comments are appropriate when they capture intent, clarify a non-obvious tradeoff, or explain why a specific approach was chosen. Comments that only restate what the code already says should be avoided because they add maintenance overhead without improving understanding.

Testing and implementation quality should move together. New code should be written in a way that is straightforward to test, and feature work should include the appropriate unit, integration, or end-to-end coverage described in the testing guidelines. Code that is difficult to test is often a sign that responsibilities are too tightly coupled.

Changes should be incremental and focused. Avoid mixing unrelated refactors into feature work unless they are necessary to complete the task safely. Preserve existing public behavior unless a requirement explicitly changes it, and prefer small, reviewable improvements over sweeping rewrites. The standard for completion is working code that is understandable, maintainable, and aligned with the rest of the project.