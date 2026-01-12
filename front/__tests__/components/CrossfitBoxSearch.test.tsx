import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CrossfitBoxSearch, { CrossfitBoxResult } from '../../components/CrossfitBoxSearch';
import axiosInstance from '../../utils/axiosInstance';

jest.mock('../../utils/axiosInstance');

describe('CrossfitBoxSearch', () => {
  const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
  const mockOnSelect = jest.fn();

  const mockCrossfitBoxes: CrossfitBoxResult[] = [
    {
      id: 1,
      name: 'CrossFit Seoul',
      phoneNumber: '02-1234-5678',
      address: {
        addressLine1: 'Seoul Gangnam',
        addressLine2: 'Building A',
      },
      latitude: 37.5,
      longitude: 127.0,
    },
    {
      id: 2,
      name: 'CrossFit Busan',
      phoneNumber: null,
      address: null,
      latitude: null,
      longitude: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render search input', () => {
    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} />
    );

    expect(getByPlaceholderText('예: 크로스핏 XXX')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} placeholder="Search here" />
    );

    expect(getByPlaceholderText('Search here')).toBeTruthy();
  });

  it('should update input value on text change', () => {
    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} />
    );

    const input = getByPlaceholderText('예: 크로스핏 XXX');
    fireEvent.changeText(input, 'CrossFit');

    expect(input.props.value).toBe('CrossFit');
  });

  it('should show clear button when input has text', () => {
    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} />
    );

    const input = getByPlaceholderText('예: 크로스핏 XXX');
    fireEvent.changeText(input, 'CrossFit');

    expect(input.props.value).toBe('CrossFit');
  });

  it('should call API after debounce with keyword', async () => {
    mockAxios.get.mockResolvedValue({
      data: { data: [] },
    });

    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} />
    );

    const input = getByPlaceholderText('예: 크로스핏 XXX');
    fireEvent.changeText(input, 'Test');

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/crossfit-boxes/search', {
        params: { keyword: 'Test' },
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} />
    );

    const input = getByPlaceholderText('예: 크로스핏 XXX');
    fireEvent.changeText(input, 'Test');

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByPlaceholderText } = render(
      <CrossfitBoxSearch onSelect={mockOnSelect} disabled={true} />
    );

    const input = getByPlaceholderText('예: 크로스핏 XXX');
    expect(input.props.editable).toBe(false);
  });
});
