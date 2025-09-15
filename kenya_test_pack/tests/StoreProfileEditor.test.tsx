import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StoreProfileEditor from '../frontend/src/screens/StoreProfileEditor';

describe('StoreProfileEditor — Kenya specifics', () => {
  it('renders core fields and accepts +254 phone format', () => {
    const { getByPlaceholderText } = render(<StoreProfileEditor />);
    const phone = getByPlaceholderText('Contact Phone (+254...)');
    fireEvent.changeText(phone, '+254712345678');
    expect(phone.props.value).toBe('+254712345678');
  });
});
