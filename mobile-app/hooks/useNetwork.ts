import { useState } from 'react';
export function useNetwork() { return { isConnected: true, type: 'wifi' }; }