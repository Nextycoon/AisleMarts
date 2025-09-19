import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CopilotBar from '../components/CopilotBar';

test('renders mood chips and triggers callback', () => {
  const onPick = jest.fn();
  const { getByText } = render(<CopilotBar onPick={onPick} />);
  fireEvent.press(getByText('Luxurious'));
  expect(onPick).toHaveBeenCalledWith('luxury');
});