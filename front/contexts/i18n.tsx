import React, { createContext, useContext, useCallback, ReactNode } from 'react';

interface I18nContextType {
  t: (key: string) => string;
}

const translations: Record<string, string> = {
  // Common
  'common.next': '다음',
  'common.back': '이전으로',
  'common.loading': '로딩 중...',
  'common.required': '(필수)',
  'common.optional': '(선택)',
  'common.save': '저장',
  'common.success': '성공',
  'common.confirm': '확인',
  'common.error': '오류',

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
  'auth.boxId': '아이디',
  'auth.rememberId': '아이디 기억하기',
  'auth.gymAdminLogin': 'Gym Admin',
  'auth.gymAdminLoginDesc': 'Box 운영자 전용 로그인',
  'auth.gymAdminOnly': 'Box 운영자 계정만 로그인할 수 있습니다.',
  'auth.gymRegister': 'Box 회원가입',
  'auth.backToMemberLogin': '일반 회원 로그인으로 돌아가기',

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
  'role.crossfitBox': 'Box',
  'role.crossfitBoxDesc': 'Box 운영자',

  // Basic Info
  'info.basic': '기본 정보',
  'info.additional': '추가 정보',

  // Member
  'member.title': '일반 회원 가입',
  'member.additionalInfo': '추가 정보',

  // CrossfitBox
  'crossfitBox.title': 'Box 가입',
  'crossfitBox.editTitle': 'Box 정보 수정',
  'crossfitBox.info': 'Box 정보',
  'crossfitBox.name': 'Box 이름',
  'crossfitBox.phoneNumber': '전화번호',
  'crossfitBox.etcInfo': '기타 정보',
  'crossfitBox.etcInfoPlaceholder': '가까운 역, 버스 정류장 등',
  'crossfitBox.facilityInfo': '시설 정보',
  'crossfitBox.parking': '주차 가능',
  'crossfitBox.wear': '운동복 대여',
  'crossfitBox.locker': '락커 제공',
  'crossfitBox.dropInFee': '드랍인 비용',
  'crossfitBox.dropInFeePlaceholder': '30000',
  'crossfitBox.requiredFields': 'Box 이름, 주소, 전화번호는 필수입니다.',

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

  // MyPage
  'mypage.title': '마이페이지',
  'mypage.profile': '프로필',
  'mypage.editProfile': '프로필 수정',
  'mypage.changePassword': '비밀번호 변경',
  'mypage.currentPassword': '현재 비밀번호',
  'mypage.newPassword': '새 비밀번호',
  'mypage.newPasswordConfirm': '새 비밀번호 확인',
  'mypage.notification': '알림 설정',
  'mypage.notificationEnabled': '알림 받기',
  'mypage.logout': '로그아웃',
  'mypage.logoutConfirm': '정말 로그아웃 하시겠습니까?',
  'mypage.withdraw': '회원 탈퇴',
  'mypage.withdrawConfirm': '정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.',
  'mypage.withdrawSuccess': '회원 탈퇴가 완료되었습니다.',
  'mypage.profileImage': '프로필 사진',
  'mypage.changeProfileImage': '프로필 사진 변경',
  'mypage.deleteProfileImage': '프로필 사진 삭제',
  'mypage.deleteImageConfirm': '프로필 사진을 삭제하시겠습니까?',
  'mypage.save': '저장',
  'mypage.cancel': '취소',
  'mypage.delete': '삭제',
  'mypage.updateSuccess': '수정되었습니다.',
  'mypage.passwordChangeSuccess': '비밀번호가 변경되었습니다.',
  'mypage.profileUpdated': '정보가 수정되었습니다.',
  'mypage.nickname': '닉네임',
  'mypage.permissionRequired': '권한이 필요합니다',
  'mypage.photoLibraryPermission': '사진 라이브러리 접근 권한이 필요합니다.',
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const t = useCallback((key: string): string => {
    return translations[key] || key;
  }, []);

  return (
    <I18nContext.Provider value={{ t }}>
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
