import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useColorScheme } from '../../hooks/useColorScheme';

jest.mock('../../hooks/useColorScheme');

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return light color when in light mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
    );

    expect(result.current).toBe('#FFFFFF');
  });

  it('should return dark color when in dark mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
    );

    expect(result.current).toBe('#000000');
  });

  it('should return color from Colors constant when prop is not provided', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() => useThemeColor({}, 'text'));

    expect(result.current).toBeDefined();
  });

  it('should default to light mode when theme is null', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
    );

    expect(result.current).toBe('#FFFFFF');
  });

  it('should prefer provided color over Colors constant', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({ light: '#CUSTOM' }, 'text')
    );

    expect(result.current).toBe('#CUSTOM');
  });
});
