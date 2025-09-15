import React from 'react';
import ChurchPaymentProcessorDashboard from '@/components/admin/ChurchPaymentProcessorDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted">
      <ChurchPaymentProcessorDashboard />
    </div>
  );
};

export default AdminDashboardPage;