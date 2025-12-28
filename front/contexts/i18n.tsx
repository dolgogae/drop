import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'ko' | 'en';

interface I18nContextType {
  language: Language;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  ko: {
    // Common
    'common.next': '다음',
    'common.back': '이전으로',
    'common.loading': '로딩 중...',
    'common.required': '(필수)',
    'common.optional': '(선택)',

    // Auth
    'auth.login': '로그인',
    'auth.register': '회원가입',
    'auth.logout': '로그아웃',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.passwordConfirm': '비밀번호 확인',
    'auth.name': '이름',
    'auth.goToLogin': '로그인으로 돌아가기',
    'auth.goToRegister': '회원가입',
    'auth.loginSuccess': '로그인 성공!',
    'auth.loginFailed': '로그인 실패',
    'auth.registerSuccess': '회원가입 성공!',
    'auth.registerFailed': '회원가입 실패',
    'auth.redirectToLogin': '로그인 화면으로 이동합니다.',
    'auth.registering': '가입 중...',
    'auth.completeRegister': '회원가입 완료',
    'auth.loggingIn': '로그인 중...',
    'auth.or': '또는',
    'auth.googleLogin': 'Google로 로그인',
    'auth.appleLogin': 'Apple로 로그인',
    'auth.kakaoLogin': '카카오로 로그인',
    'auth.autoLogin': '자동 로그인',
    'auth.rememberEmail': '아이디 기억하기',

    // Validation
    'validation.fillAll': '모든 항목을 입력해주세요.',
    'validation.passwordMismatch': '비밀번호가 일치하지 않습니다.',
    'validation.selectRole': '회원 유형을 선택해주세요.',
    'validation.networkError': '서버에 연결할 수 없습니다.',
    'validation.invalidCredentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'validation.error': '오류가 발생했습니다.',
    'validation.invalidEmail': '올바른 이메일 형식이 아닙니다.',
    'validation.invalidPassword': '비밀번호는 영어 소문자, 숫자, 특수문자를 각각 1개 이상 포함하여 8자 이상이어야 합니다.',
    'validation.invalidPhoneNumber': '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',

    // Role Selection
    'role.title': '회원 유형 선택',
    'role.member': '일반 회원',
    'role.memberDesc': '트레이닝을 받고 싶은 회원',
    'role.gym': '체육관',
    'role.gymDesc': '체육관 운영자',

    // Basic Info
    'info.basic': '기본 정보',
    'info.additional': '추가 정보',

    // Member
    'member.title': '일반 회원 가입',
    'member.additionalInfo': '추가 정보',

    // Gym
    'gym.title': '체육관 가입',
    'gym.info': '체육관 정보',
    'gym.name': '체육관 이름',
    'gym.phoneNumber': '전화번호',
    'gym.etcInfo': '기타 정보 (근처 역 등)',
    'gym.facilityInfo': '시설 정보',
    'gym.parking': '주차 가능',
    'gym.wear': '운동복 대여',
    'gym.locker': '락커 제공',
    'gym.requiredFields': '체육관 이름, 주소, 전화번호는 필수입니다.',

    // Address
    'address.title': '주소',
    'address.search': '주소 검색',
    'address.searchTitle': '주소 검색',
    'address.confirmTitle': '주소 확인',
    'address.change': '주소 변경',
    'address.detail': '상세 주소',
    'address.loadError': '주소 검색을 불러오는데 실패했습니다.',
    'address.retry': '다시 시도',
    'address.selectedAddress': '선택한 주소',
    'address.jibun': '지번',
    'address.tapToConfirm': '주소를 탭하여 선택을 완료하세요',
    'address.searchAgain': '다시 검색',
  },
  en: {
    // Common
    'common.next': 'Next',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.required': '(Required)',
    'common.optional': '(Optional)',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.passwordConfirm': 'Confirm Password',
    'auth.name': 'Name',
    'auth.goToLogin': 'Back to Login',
    'auth.goToRegister': 'Sign Up',
    'auth.loginSuccess': 'Login successful!',
    'auth.loginFailed': 'Login failed',
    'auth.registerSuccess': 'Registration successful!',
    'auth.registerFailed': 'Registration failed',
    'auth.redirectToLogin': 'Redirecting to login.',
    'auth.registering': 'Signing up...',
    'auth.completeRegister': 'Complete Registration',
    'auth.loggingIn': 'Logging in...',
    'auth.or': 'or',
    'auth.googleLogin': 'Sign in with Google',
    'auth.appleLogin': 'Sign in with Apple',
    'auth.kakaoLogin': 'Sign in with Kakao',
    'auth.autoLogin': 'Auto Login',
    'auth.rememberEmail': 'Remember Email',

    // Validation
    'validation.fillAll': 'Please fill in all fields.',
    'validation.passwordMismatch': 'Passwords do not match.',
    'validation.selectRole': 'Please select a user type.',
    'validation.networkError': 'Unable to connect to server.',
    'validation.invalidCredentials': 'Invalid email or password.',
    'validation.error': 'An error occurred.',
    'validation.invalidEmail': 'Please enter a valid email address.',
    'validation.invalidPassword': 'Password must be at least 8 characters with lowercase, number, and special character.',
    'validation.invalidPhoneNumber': 'Invalid phone number format. (e.g., 010-1234-5678)',

    // Role Selection
    'role.title': 'Select User Type',
    'role.member': 'Member',
    'role.memberDesc': 'Looking for training',
    'role.gym': 'Gym',
    'role.gymDesc': 'Gym operator',

    // Basic Info
    'info.basic': 'Basic Information',
    'info.additional': 'Additional Information',

    // Member
    'member.title': 'Member Registration',
    'member.additionalInfo': 'Additional Information',

    // Gym
    'gym.title': 'Gym Registration',
    'gym.info': 'Gym Information',
    'gym.name': 'Gym Name',
    'gym.phoneNumber': 'Phone Number',
    'gym.etcInfo': 'Other Info (nearby stations, etc.)',
    'gym.facilityInfo': 'Facility Information',
    'gym.parking': 'Parking Available',
    'gym.wear': 'Workout Clothes Rental',
    'gym.locker': 'Locker Available',
    'gym.requiredFields': 'Gym name, address, and phone number are required.',

    // Address
    'address.title': 'Address',
    'address.search': 'Search Address',
    'address.searchTitle': 'Search Address',
    'address.confirmTitle': 'Confirm Address',
    'address.change': 'Change Address',
    'address.detail': 'Detail Address',
    'address.loadError': 'Failed to load address search.',
    'address.retry': 'Retry',
    'address.selectedAddress': 'Selected Address',
    'address.jibun': 'Jibun',
    'address.tapToConfirm': 'Tap the address to confirm',
    'address.searchAgain': 'Search Again',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_KEY = 'app_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko');

  React.useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
      if (saved === 'ko' || saved === 'en') {
        setLanguage(saved);
      }
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    AsyncStorage.setItem(LANGUAGE_KEY, newLang);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
