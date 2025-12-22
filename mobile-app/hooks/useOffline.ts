import { useState } from 'react';
export function useOffline() { return { isOnline: true, pending: 0 }; }