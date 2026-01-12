module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@reduxjs/toolkit|immer)'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/coverage/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/app/**', // 화면 컴포넌트 제외
    '!**/contexts/**', // Context 제외
    '!**/@types/**', // 타입 정의 제외
    '!**/constants/**', // 상수 제외
    '!**/hooks/useGoogleAuth.ts', // 인증 hook 제외
    '!**/hooks/useColorScheme*.ts', // Platform-specific hooks 제외
    '!**/utils/axiosInstance.ts', // axios 인스턴스 제외 (통합 테스트 대상)
    '!**/components/ui/**', // UI 라이브러리 컴포넌트 제외
    '!**/components/ParallaxScrollView.tsx', // 복잡한 스크롤 애니메이션 컴포넌트 제외
    '!**/components/HapticTab.tsx', // 네이티브 모듈 의존 컴포넌트 제외
    '!**/components/HelloWave.tsx', // 애니메이션 컴포넌트 제외
    '!**/components/AddressSearchModal.tsx', // WebView 및 복잡한 네이티브 모듈 의존 컴포넌트 제외
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
};
