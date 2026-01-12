import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../../components/ThemedText';

jest.mock('../../hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

describe('ThemedText', () => {
  it('should render text content', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);

    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should apply default type styles', () => {
    const { getByText } = render(<ThemedText>Default Text</ThemedText>);
    const textElement = getByText('Default Text');

    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontSize: 16 })
    );
  });

  it('should apply title type styles', () => {
    const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
    const textElement = getByText('Title Text');

    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontSize: 32, fontWeight: 'bold' })
    );
  });

  it('should apply subtitle type styles', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle</ThemedText>);
    const textElement = getByText('Subtitle');

    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontSize: 20, fontWeight: 'bold' })
    );
  });

  it('should apply link type styles', () => {
    const { getByText } = render(<ThemedText type="link">Link</ThemedText>);
    const textElement = getByText('Link');

    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontSize: 16 })
    );
  });

  it('should apply defaultSemiBold type styles', () => {
    const { getByText } = render(<ThemedText type="defaultSemiBold">Bold Text</ThemedText>);
    const textElement = getByText('Bold Text');

    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontWeight: '600' })
    );
  });

  it('should accept custom style prop', () => {
    const customStyle = { marginTop: 10 };
    const { getByText } = render(
      <ThemedText style={customStyle}>Custom Style</ThemedText>
    );
    const textElement = getByText('Custom Style');

    expect(textElement.props.style).toContainEqual(customStyle);
  });

  it('should pass through other Text props', () => {
    const { getByText } = render(
      <ThemedText numberOfLines={2} testID="test-text">
        Long Text
      </ThemedText>
    );
    const textElement = getByText('Long Text');

    expect(textElement.props.numberOfLines).toBe(2);
  });
});
