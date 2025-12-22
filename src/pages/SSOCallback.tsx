import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SSOCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  useEffect(() => { const code = params.get('code'); if (code) { setTimeout(() => navigate('/'), 1000); } }, [params, navigate]);
  return <div className='min-h-screen flex items-center justify-center'><p>Processing SSO login...</p></div>;
}