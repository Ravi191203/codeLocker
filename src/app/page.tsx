
import { Suspense } from 'react';
import DashboardPageContent from '@/components/codekeep/dashboard-page-content';

// This is the main server component for the page
export default function DashboardPage() {
  // Data fetching is now handled on the client in DashboardPageContent
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  );
}
