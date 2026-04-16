# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DROP is a fitness platform for finding nearby CrossFit boxes on a map and checking Drop-in availability. Monorepo with a Spring Boot backend (`back/`) and React Native/Expo frontend (`front/`).

## Build & Run Commands

### Backend (back/)
```bash
./gradlew bootRun                    # Run server (port 8080)
./gradlew build                      # Full Spring build
./gradlew test                       # Run all tests
./gradlew test --tests "com.drop.unit.domain.crossfitbox.CrossfitBoxControllerTest"  # Single test class
./gradlew compileJava                # Compile only
./gradlew jacocoTestReport           # Generate coverage report
```
Profiles: `local` (H2 in-memory), `dev` (MySQL), `docker`

### Frontend (front/)
```bash
npm install                          # Install dependencies
npx expo start                       # Start Expo dev server
npm run lint                         # Expo ESLint (config: front/eslint.config.js)
npm test                             # Run tests
npm run test:watch                   # Watch mode
npm run test:coverage                # Coverage report (70% threshold)
```

### Docker
```bash
cd back/deployment/docker-compose
docker-compose up                    # MySQL + Redis + Backend
```

## Architecture

### Backend
- **Java 17, Spring Boot 2.7, Gradle**
- **Domain-Driven Design**: each domain in `com.drop.domain.*` has its own `controller/`, `service/`, `repository/`, `data/` (entities), `dto/`, `mapper/` layers
- **Key domains**: `auth`, `member`, `crossfitbox`, `schedule`, `review`, `geocoding`, `dashboard`, `mypage`, `gymsync` (batch sync of external gym data)
- **Global cross-cutting code** in `com.drop.global.*`: `security/` (JWT filters, OAuth2, AES encryption), `config/`, `code/` (error codes/response wrappers), `redis/`, `aop/`, `enums/`
- **QueryDSL** for complex queries, **MapStruct** for DTO mapping, **Lombok** for boilerplate
- **Auth**: JWT + Google OAuth2, role-based (ADMIN, GYM, TRAINER, USER)
- **Database**: MySQL 8 (primary), Redis 7 (caching/session), H2 (local dev)
- **API docs**: Swagger at `http://localhost:8080/swagger-ui/index.html`

### Frontend
- **React Native 0.79, Expo 53, TypeScript 5.8**
- **Expo Router 5** file-based routing in `app/`
- **Redux Toolkit** for state (auth slice, user slice) in `store.ts`
- **Axios** with interceptors in `utils/axiosInstance.ts`
- Tab screens: Map (index), Dashboard, Search, MyPage
- Key env vars in `front/.env`: `API_BASE_URL`, `GOOGLE_OAUTH_CLIENT_ID`

## Key Conventions

- Backend entities extend `BaseEntity` (auto-managed createdAt/updatedAt via JPA Auditing)
- Address is an `@Embeddable` shared across entities (`com.drop.domain.base.data.Address`)
- Error handling uses custom `ErrorCode` enum mapped to HTTP status, wrapped in `ErrorResponse`
- Backend tests live in `back/src/test/java/com/drop/unit/` following the domain structure
- Frontend tests live in `front/__tests__/`; Jest with `jest-expo` preset; coverage excludes UI components, contexts, hooks
- Indentation: 2 spaces in `front/`, 4 spaces in `back/`. Follow existing local style — don't reformat unrelated files.
- Commits use Conventional Commits (`feat:`, `fix:`, etc.); subjects are short and specific
- The project README and code comments are in Korean

## Configuration & Secrets

- Backend secrets: copy `back/src/main/resources/application-secret.yml.example` locally — do not commit real values
- Required backend env: `KAKAO_REST_API_KEY` (address search), DB connection info, JWT secret
- Frontend env lives in `front/.env` (`API_BASE_URL`, `GOOGLE_OAUTH_CLIENT_ID`)
