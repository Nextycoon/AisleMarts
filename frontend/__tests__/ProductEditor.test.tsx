import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductEditor from '../frontend/src/screens/ProductEditor';

describe('ProductEditor — Variants', () => {
  it('adds a variant row', () => {
    const { getByText, queryAllByText } = render(<ProductEditor />);
    fireEvent.press(getByText('+ Add Variant'));
    expect(queryAllByText('Variant').length).toBeGreaterThan(0);
  });
});
