import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        if (!hasVerified.current) return;
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-component">
      <div className="bg-white p-section rounded-lg shadow-lg w-full max-w-[400px] text-center">
        {status === 'verifying' && (
          <>
            <h2 className="text-text text-[2.5rem] font-semibold mb-element">Verifying Email...</h2>
            <p className="text-text text-base mb-component">Please wait while we verify your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h2 className="text-success text-[2.5rem] font-semibold mb-element">Email Verified!</h2>
            <p className="text-text text-base mb-component">{message}</p>
            <div className="w-10 h-10 mx-auto border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-error text-[2.5rem] font-semibold mb-element">Verification Failed</h2>
            <p className="text-text-light text-base mb-component">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
