import React from 'react';
import { render } from '@testing-library/react-native';
import SellerDashboard from '../frontend/src/screens/SellerDashboard';

describe('SellerDashboard', () => {
  it('renders KPIs and product list header', () => {
    const { getByText } = render(<SellerDashboard />);
    expect(getByText(/Revenue \(30d\)/)).toBeTruthy();
    expect(getByText(/Products/)).toBeTruthy();
  });
});
