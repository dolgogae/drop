import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../../components/ThemedView';
import { Text } from 'react-native';

jest.mock('../../hooks/useThemeColor', () => ({
  useThemeColor: () => '#FFFFFF',
}));

describe('ThemedView', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Child Content</Text>
      </ThemedView>
    );

    expect(getByText('Child Content')).toBeTruthy();
  });

  it('should apply background color from theme', () => {
    const { UNSAFE_root } = render(<ThemedView />);
    const view = UNSAFE_root.findByType('View');

    expect(view.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#FFFFFF' })
    );
  });

  it('should accept custom style prop', () => {
    const customStyle = { padding: 10, margin: 5 };
    const { UNSAFE_root } = render(<ThemedView style={customStyle} />);
    const view = UNSAFE_root.findByType('View');

    expect(view.props.style).toContainEqual(customStyle);
  });

  it('should pass through other View props', () => {
    const { UNSAFE_root } = render(
      <ThemedView testID="test-view" accessibilityLabel="Test View" />
    );
    const view = UNSAFE_root.findByType('View');

    expect(view.props.accessibilityLabel).toBe('Test View');
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </ThemedView>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });
});
