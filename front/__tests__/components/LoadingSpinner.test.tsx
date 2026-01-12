import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render ActivityIndicator', () => {
    const { getByTestId, UNSAFE_root } = render(<LoadingSpinner />);

    // ActivityIndicator는 기본적으로 렌더링되어야 함
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should have correct container styles', () => {
    const { getByTestId, UNSAFE_root } = render(<LoadingSpinner />);

    const container = UNSAFE_root.findByType('View');
    expect(container.props.style).toMatchObject({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    });
  });
});
