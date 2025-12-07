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

    // Validation
    'validation.fillAll': '모든 항목을 입력해주세요.',
    'validation.passwordMismatch': '비밀번호가 일치하지 않습니다.',
    'validation.selectRole': '회원 유형을 선택해주세요.',
    'validation.networkError': '서버에 연결할 수 없습니다.',
    'validation.error': '오류가 발생했습니다.',

    // Role Selection
    'role.title': '회원 유형 선택',
    'role.member': '일반 회원',
    'role.memberDesc': '트레이닝을 받고 싶은 회원',
    'role.trainer': '트레이너',
    'role.trainerDesc': '회원을 가르치는 트레이너',
    'role.gym': '체육관',
    'role.gymDesc': '체육관 운영자',

    // Basic Info
    'info.basic': '기본 정보',
    'info.additional': '추가 정보',

    // Member
    'member.title': '일반 회원 가입',
    'member.additionalInfo': '추가 정보',

    // Trainer
    'trainer.title': '트레이너 가입',
    'trainer.info': '트레이너 정보',
    'trainer.shortIntro': '짧은 소개',
    'trainer.longIntro': '상세 소개',
    'trainer.shortIntroRequired': '짧은 소개를 입력해주세요.',

    // Gym
    'gym.title': '체육관 가입',
    'gym.info': '체육관 정보',
    'gym.name': '체육관 이름',
    'gym.location': '위치',
    'gym.phoneNumber': '전화번호',
    'gym.etcInfo': '기타 정보 (근처 역 등)',
    'gym.facilityInfo': '시설 정보',
    'gym.parking': '주차 가능',
    'gym.wear': '운동복 대여',
    'gym.locker': '락커 제공',
    'gym.requiredFields': '체육관 이름, 위치, 전화번호는 필수입니다.',
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

    // Validation
    'validation.fillAll': 'Please fill in all fields.',
    'validation.passwordMismatch': 'Passwords do not match.',
    'validation.selectRole': 'Please select a user type.',
    'validation.networkError': 'Unable to connect to server.',
    'validation.error': 'An error occurred.',

    // Role Selection
    'role.title': 'Select User Type',
    'role.member': 'Member',
    'role.memberDesc': 'Looking for training',
    'role.trainer': 'Trainer',
    'role.trainerDesc': 'Personal trainer',
    'role.gym': 'Gym',
    'role.gymDesc': 'Gym operator',

    // Basic Info
    'info.basic': 'Basic Information',
    'info.additional': 'Additional Information',

    // Member
    'member.title': 'Member Registration',
    'member.additionalInfo': 'Additional Information',

    // Trainer
    'trainer.title': 'Trainer Registration',
    'trainer.info': 'Trainer Information',
    'trainer.shortIntro': 'Short Introduction',
    'trainer.longIntro': 'Detailed Introduction',
    'trainer.shortIntroRequired': 'Please enter a short introduction.',

    // Gym
    'gym.title': 'Gym Registration',
    'gym.info': 'Gym Information',
    'gym.name': 'Gym Name',
    'gym.location': 'Location',
    'gym.phoneNumber': 'Phone Number',
    'gym.etcInfo': 'Other Info (nearby stations, etc.)',
    'gym.facilityInfo': 'Facility Information',
    'gym.parking': 'Parking Available',
    'gym.wear': 'Workout Clothes Rental',
    'gym.locker': 'Locker Available',
    'gym.requiredFields': 'Gym name, location, and phone number are required.',
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
