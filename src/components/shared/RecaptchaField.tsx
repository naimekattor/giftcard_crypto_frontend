'use client';

import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaFieldProps {
  onVerify: (token: string | null) => void;
  className?: string;
}

export function RecaptchaField({ onVerify, className = '' }: RecaptchaFieldProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Default test key

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  const handleExpired = () => {
    onVerify(null);
  };

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        theme="light"
      />
    </div>
  );
}
