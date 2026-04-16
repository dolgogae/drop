# Repository Guidelines

## Project Structure & Module Organization
This repository is split into `front/` and `back/`. `front/` contains the Expo React Native app: routes live in `front/app/`, shared UI in `front/components/`, app logic in `front/hooks/`, `front/contexts/`, and `front/utils/`, static assets in `front/assets/`, and Jest tests in `front/__tests__/`. `back/` contains the Spring Boot API: production code is under `back/src/main/java/com/drop/`, configuration files under `back/src/main/resources/`, and unit tests under `back/src/test/java/com/drop/unit/`.

## Build, Test, and Development Commands
Frontend:
- `cd front && npm install` installs dependencies.
- `cd front && npm run start` starts Expo locally.
- `cd front && npm run ios` or `npm run android` runs a native build.
- `cd front && npm run lint` runs Expo ESLint.
- `cd front && npm test` runs Jest once.
- `cd front && npm run test:coverage` generates coverage and enforces the global threshold.

Backend:
- `cd back && ./gradlew bootRun` starts the API.
- `cd back && ./gradlew test` runs JUnit 5 tests and JaCoCo reporting.
- `cd back && ./gradlew build` produces the full Spring build.

## Coding Style & Naming Conventions
Follow existing local style instead of reformatting unrelated files. In `front/`, use TypeScript, 2-space indentation, PascalCase component names, and camelCase hooks/utilities. Route files should match Expo Router conventions such as `app/(tabs)/index.tsx`. In `back/`, use 4-space indentation, PascalCase class names, and package paths grouped by domain, for example `com.drop.domain.review.service`. Linting is configured in `front/eslint.config.js`.

## Testing Guidelines
Frontend tests use Jest with React Native Testing Library; prefer `*.test.ts` or `*.test.tsx` and keep tests close to behavior-focused units. The frontend enforces 70% global coverage. Backend tests use JUnit 5, Mockito, and Spring test support; mirror package structure under `back/src/test/java/com/drop/unit/` and name files `*Test.java`.

## Commit & Pull Request Guidelines
Recent history favors concise Conventional Commit prefixes such as `feat:` and `fix:`. Keep subjects short and specific, for example `fix: address fallback for translation failures`. Pull requests should describe the user-visible change, list affected modules (`front` or `back`), link the issue when applicable, and include screenshots for UI changes or sample request/response details for API work.

## Security & Configuration Tips
Do not commit secrets. Frontend environment values belong in `front/.env`. Backend secrets should be supplied via local config derived from `back/src/main/resources/application-secret.yml.example`. Validate OAuth, JWT, database, Redis, and external API settings before running integration flows.
