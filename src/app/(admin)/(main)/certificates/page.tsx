'use client';

import { useState, useEffect } from 'react';
import Wrapper from '@/layout/Wrapper';
import CertCards from '@/components/CertCards';
import CertificateUpload from '@/components/CertificateUpload';

export default function CertificatesPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.user && data.user.role === 'ADMIN') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Wrapper>
      <CertCards 
        onUpload={isAdmin ? () => setShowUpload(true) : undefined} 
        refreshTrigger={refreshTrigger} 
        isAdmin={isAdmin}
      />
      {showUpload && isAdmin && (
        <CertificateUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUpload(false)}
        />
      )}
    </Wrapper>
  );
}