import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock axios
jest.mock('axios');

import ProductEditor from '../src/screens/ProductEditor';

describe('ProductEditor', () => {
  it('adds a variant row successfully', () => {
    const { getByText } = render(<ProductEditor />);
    const addButton = getByText('+ Add Variant');
    fireEvent.press(addButton);
    expect(getByText('Variant')).toBeTruthy();
  });
});