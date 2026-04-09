# Testing Guidelines

This document defines the testing principles and standards for the TODO application.

## Core Principles

1. All new features should include appropriate automated tests.
2. Tests should be maintainable, readable, and focused on user and system behavior.
3. Tests should be isolated and independent so they can run in any order.
4. Each test should create or arrange its own data and should not rely on state from another test.
5. Setup and teardown hooks are required wherever shared test lifecycle management is needed.
6. Test suites must pass consistently across repeated runs in local and CI environments.

## Unit Tests

1. Use Jest to test individual functions and React components in isolation.
2. Unit test files should use the naming convention `*.test.js` or `*.test.ts`.
3. Backend unit tests should be placed in `packages/backend/__tests__/`.
4. Frontend unit tests should be placed in `packages/frontend/src/__tests__/`.
5. Unit test file names should match what they are testing when practical, such as `app.test.js` for `app.js`.
6. Unit tests should focus on business logic, component behavior, validation rules, and state changes.

## Integration Tests

1. Use Jest with Supertest to test backend API endpoints through real HTTP requests.
2. Integration tests should be placed in `packages/backend/__tests__/integration/`.
3. Integration test files should use the naming convention `*.test.js` or `*.test.ts`.
4. Integration test names should describe the feature or endpoint under test, such as `todos-api.test.js`.
5. Integration tests should cover request validation, response payloads, status codes, and persistence behavior where applicable.

## End-To-End Tests

1. Use Playwright to test complete UI workflows through browser automation.
2. E2E tests should be placed in `tests/e2e/`.
3. E2E test files should use the naming convention `*.spec.js` or `*.spec.ts`.
4. E2E test file names should reflect the user journey being tested, such as `todo-workflow.spec.js`.
5. Playwright tests must use one browser only.
6. Playwright tests must use the Page Object Model (POM) pattern for maintainability.
7. Limit E2E coverage to 5-8 critical user journeys, focusing on happy paths and key edge cases rather than exhaustive coverage.
8. E2E tests should verify the workflows that matter most to end users, such as task creation, completion, editing, filtering, and persistence.

## Port Configuration

1. Always use environment variables with sensible defaults for port configuration.
2. The backend should use the pattern `const PORT = process.env.PORT || 3030;`.
3. The frontend should default to port 3000 and allow override through the `PORT` environment variable.
4. Port configuration should support CI and automation workflows that need to assign ports dynamically.

## Test Reliability And Maintenance

1. Tests should avoid hidden coupling, shared mutable state, and timing-sensitive assumptions.
2. Mocking should be used carefully and should not replace meaningful behavior verification when real integration coverage is more appropriate.
3. Assertions should be specific enough to catch regressions without being brittle.
4. Test data should be minimal, intentional, and easy to understand.
5. Flaky tests should be treated as defects and fixed promptly.

## Coverage Expectations

1. New backend endpoints should include unit and integration coverage where appropriate.
2. New frontend behavior should include component or behavior-focused unit tests.
3. Critical cross-stack workflows should be covered by E2E tests when they represent key user journeys.
4. Test coverage should prioritize risk, business value, and regression prevention over raw coverage numbers.