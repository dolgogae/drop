import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExternalLink } from '../../components/ExternalLink';
import { Platform } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';

jest.mock('expo-web-browser');

describe('ExternalLink', () => {
  const mockOpenBrowser = openBrowserAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with href', () => {
    const { UNSAFE_root } = render(
      <ExternalLink href="https://example.com">Link Text</ExternalLink>
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should have onPress handler', () => {
    const { UNSAFE_root } = render(
      <ExternalLink href="https://example.com">Click me</ExternalLink>
    );

    const textElements = UNSAFE_root.findAllByType('Text');
    expect(textElements.length).toBeGreaterThan(0);
    expect(textElements[0].props.onPress).toBeDefined();
  });

  it('should render href prop', () => {
    const { UNSAFE_root } = render(
      <ExternalLink href="https://example.com">Link</ExternalLink>
    );
    const textElements = UNSAFE_root.findAllByType('Text');

    expect(textElements[0].props.href).toBe('https://example.com');
  });

  it('should pass through testID prop', () => {
    const { UNSAFE_root } = render(
      <ExternalLink
        href="https://example.com"
        testID="external-link"
      >
        Link
      </ExternalLink>
    );

    const textElements = UNSAFE_root.findAllByType('Text');
    expect(textElements[0].props.testID).toBe('external-link');
  });
});
