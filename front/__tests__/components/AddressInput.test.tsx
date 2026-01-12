import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddressInput from '../../components/AddressInput';
import axiosInstance from '../../utils/axiosInstance';

jest.mock('../../utils/axiosInstance');

describe('AddressInput', () => {
  const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
  const mockOnChangeText = jest.fn();
  const mockOnValidAddress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render input field', () => {
    const { getByPlaceholderText } = render(
      <AddressInput value="" onChangeText={mockOnChangeText} />
    );

    expect(getByPlaceholderText('주소를 입력하세요')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <AddressInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter address"
      />
    );

    expect(getByPlaceholderText('Enter address')).toBeTruthy();
  });

  it('should call onChangeText when input changes', () => {
    const { getByPlaceholderText } = render(
      <AddressInput value="" onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText('주소를 입력하세요');
    fireEvent.changeText(input, 'Seoul');

    expect(mockOnChangeText).toHaveBeenCalledWith('Seoul');
  });

  it('should display input value', () => {
    const { getByPlaceholderText } = render(
      <AddressInput value="Seoul Gangnam" onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText('주소를 입력하세요');
    expect(input.props.value).toBe('Seoul Gangnam');
  });

  it('should call axios get after debounce', async () => {
    mockAxios.get.mockResolvedValue({
      data: {
        valid: true,
        address: 'Test',
        roadAddress: 'Test Road',
        latitude: 37.5,
        longitude: 127.0,
        message: 'Valid',
      }
    });

    render(
      <AddressInput value="Test Address" onChangeText={mockOnChangeText} />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/address/validate', {
        params: { query: 'Test Address' },
      });
    });
  });

  it('should not validate if input is less than 2 characters', () => {
    render(
      <AddressInput value="A" onChangeText={mockOnChangeText} />
    );

    jest.advanceTimersByTime(500);

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should handle API error gracefully', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AddressInput value="TestAddress" onChangeText={mockOnChangeText} />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
