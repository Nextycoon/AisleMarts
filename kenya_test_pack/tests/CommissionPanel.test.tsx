import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CommissionPanel from '../frontend/src/screens/CommissionPanel';

describe('CommissionPanel', () => {
  it('renders 1% commission tile', async () => {
    const { getByText } = render(<CommissionPanel />);
    await waitFor(() => {
      expect(getByText(/Commission \(1%\)/)).toBeTruthy();
    });
  });
});
