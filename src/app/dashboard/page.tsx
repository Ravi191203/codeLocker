import { Suspense } from 'react';
import DashboardPageContent from '@/components/codekeep/dashboard-page-content';

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  );
}
