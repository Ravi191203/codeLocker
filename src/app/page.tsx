import { Suspense } from 'react';
import { getSnippets } from '@/app/actions';
import HomePageContent from '@/components/codekeep/home-page-content';

export default async function DashboardPage() {
  const snippets = await getSnippets();
  
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <HomePageContent initialSnippets={snippets} />
    </Suspense>
  )
}
