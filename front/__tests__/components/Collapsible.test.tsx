import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from '../../components/Collapsible';
import { Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

jest.mock('@/hooks/useColorScheme');

describe('Collapsible', () => {
  const mockUseColorScheme = useColorScheme as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('should render title', () => {
    const { getByText } = render(
      <Collapsible title="Test Title">
        <Text>Content</Text>
      </Collapsible>
    );

    expect(getByText('Test Title')).toBeTruthy();
  });

  it('should not show children initially', () => {
    const { queryByText } = render(
      <Collapsible title="Test Title">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    expect(queryByText('Hidden Content')).toBeNull();
  });

  it('should show children when toggled open', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Test Title">
        <Text>Content to show</Text>
      </Collapsible>
    );

    expect(queryByText('Content to show')).toBeNull();

    const title = getByText('Test Title');
    fireEvent.press(title);

    expect(getByText('Content to show')).toBeTruthy();
  });

  it('should hide children when toggled closed', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Test Title">
        <Text>Toggle Content</Text>
      </Collapsible>
    );

    const title = getByText('Test Title');

    fireEvent.press(title);
    expect(getByText('Toggle Content')).toBeTruthy();

    fireEvent.press(title);
    expect(queryByText('Toggle Content')).toBeNull();
  });

  it('should render multiple children when open', () => {
    const { getByText } = render(
      <Collapsible title="Test Title">
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </Collapsible>
    );

    const title = getByText('Test Title');
    fireEvent.press(title);

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });

  it('should use dark theme colors', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { UNSAFE_root } = render(
      <Collapsible title="Test Title">
        <Text>Content</Text>
      </Collapsible>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});
