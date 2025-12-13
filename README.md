# DROP

주변 체육관과 크로스핏 박스를 지도에서 찾을 수 있는 피트니스 플랫폼

## 주요 기능

- 지도 기반 체육관 검색 (Google Maps)
- 주소 검색 및 좌표 변환 (Kakao API)
- 체육관 등록 및 요금제 관리
- JWT 기반 사용자 인증

## 기술 스택

### Frontend
- React Native / Expo
- TypeScript
- Redux Toolkit

### Backend
- Spring Boot 2.7
- Java 17
- MySQL / Redis
- Spring Security + JWT

## 프로젝트 구조

```
drop/
├── front/          # React Native 앱
└── back/           # Spring Boot API 서버
```

## 실행 방법

### Backend
```bash
cd back
./gradlew bootRun
```

### Frontend
```bash
cd front
npm install
npx expo start
```

## 환경 변수

**Frontend** (`front/.env`)
```
API_BASE_URL=http://localhost:8080/api
```

**Backend**: `KAKAO_REST_API_KEY` 환경변수 설정 필요

## API 문서

http://localhost:8080/swagger-ui/index.html
