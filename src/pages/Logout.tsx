import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => { setTimeout(() => navigate('/login'), 1000); }, [navigate]);
  return <div className='min-h-screen flex items-center justify-center'><p>Logging out...</p></div>;
}