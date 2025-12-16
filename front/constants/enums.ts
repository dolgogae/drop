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

/**
 * 위치 모드에 따른 표시 텍스트
 */
export const LocationModeText: Record<LocationMode, string> = {
  [LocationMode.CURRENT]: '현재 위치 기준',
  [LocationMode.LAST]: '마지막으로 본 위치',
};
