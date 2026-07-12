import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import SplitScreen from './layout/SplitScreen';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SplitScreen />
      </DataProvider>
    </AuthProvider>
  );
}
