/**
 * 홈 화면 상태
 */
export enum HomeState {
  LOADING = 'loading',
  SUCCESS = 'success',
  EMPTY = 'empty',
  ERROR = 'error',
  PERMISSION_DENIED = 'permission_denied',
}

/**
 * 위치 모드 (Backend LocationMode와 동일)
 */
export enum LocationMode {
  CURRENT = 'current',
  LAST = 'last',
}

