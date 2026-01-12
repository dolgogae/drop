# DROP

주변 크로스핏 박스를 지도에서 찾고, Drop-in 정보를 확인할 수 있는 피트니스 플랫폼

## 주요 기능

### 사용자 기능
- **지도 기반 검색**: 지도에서 주변 크로스핏 박스 검색 및 확인
- **대시보드**: 등록된 크로스핏 박스 목록 및 상세 정보
- **검색**: 주소 기반 박스 검색 (Kakao API)
- **마이페이지**: 프로필 관리, 비밀번호 변경, 프로필 이미지 업로드
- **Drop-in**: 타 박스 방문 일정 및 정보 관리
- **소셜 로그인**: Google OAuth 인증 지원

### 관리자 기능
- 크로스핏 박스 등록 및 수정
- 박스 스케줄 관리
- Drop-in 정보 관리

### 인증
- JWT 기반 인증
- Google OAuth 소셜 로그인

## 기술 스택

### Frontend
- **Framework**: React Native (0.79) / Expo (53)
- **Navigation**: Expo Router 5 (파일 기반 라우팅)
- **Language**: TypeScript 5.8
- **State Management**: Redux Toolkit
- **UI/UX**:
  - React Native Maps (지도)
  - Expo Image Picker (이미지 업로드)
  - Expo Location (위치 정보)
- **Testing**: Jest (70% 커버리지)
- **HTTP Client**: Axios

### Backend
- **Framework**: Spring Boot 2.7
- **Language**: Java 17
- **Database**: MySQL / Redis
- **Security**: Spring Security + JWT
- **API Docs**: Swagger/OpenAPI

## 프로젝트 구조

```
drop/
├── front/                      # React Native 앱
│   ├── app/                    # Expo Router 기반 라우팅
│   │   ├── (tabs)/            # 탭 네비게이션
│   │   │   ├── index.tsx      # 지도 화면
│   │   │   ├── dashboard.tsx  # 대시보드
│   │   │   ├── search.tsx     # 검색
│   │   │   └── mypage.tsx     # 마이페이지
│   │   ├── admin/             # 관리자 페이지
│   │   ├── login/             # 로그인
│   │   ├── register/          # 회원가입 (일반/박스)
│   │   ├── mypage/            # 마이페이지 세부
│   │   └── crossfit-box/      # 박스 상세
│   ├── components/            # 재사용 컴포넌트
│   ├── hooks/                 # 커스텀 훅
│   ├── constants/             # 상수 및 설정
│   └── store.ts              # Redux 스토어
└── back/                      # Spring Boot API 서버
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

### 테스트
```bash
cd front
npm test                # 단일 실행
npm run test:watch     # watch 모드
npm run test:coverage  # 커버리지 리포트
```

## 환경 변수

### Frontend (`front/.env`)
```env
API_BASE_URL=http://localhost:8080/api
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
```

### Backend
- `KAKAO_REST_API_KEY`: Kakao API 키 (주소 검색용)
- Database 연결 정보
- JWT Secret Key

## API 문서

개발 서버 실행 후 접속:
```
http://localhost:8080/swagger-ui/index.html
```

## 주요 화면

- **지도**: Google Maps 기반 크로스핏 박스 위치 표시
- **대시보드**: 등록된 박스 목록 및 통계
- **검색**: 주소 기반 박스 검색
- **마이페이지**: 사용자 프로필 및 설정 관리
- **관리자**: 박스 정보 및 스케줄 관리

## 개발 현황

- ✅ 사용자 인증 (JWT, Google OAuth)
- ✅ 지도 기반 박스 검색
- ✅ 박스 등록 및 관리
- ✅ 마이페이지 (프로필, 이미지 업로드)
- ✅ Drop-in 컬럼 추가
- ✅ 관리자 페이지
- ✅ 유닛 테스트 (70% 커버리지)
