import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import { store, useAppDispatch } from './src/store';
import { loadStoredAuth } from './src/store/authSlice';
import Navigation from './src/navigation/Navigation';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load stored authentication on app startup
    dispatch(loadStoredAuth());
  }, [dispatch]);

  return (
    <>
      <StatusBar style="auto" />
      <Navigation />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
