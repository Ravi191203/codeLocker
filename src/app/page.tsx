
import { Suspense } from 'react';
import DashboardPageContent from '@/components/codekeep/dashboard-page-content';
import { getFilteredSnippets } from './actions';
import type { Snippet } from '@/lib/data';

type DashboardPageProps = {
    searchParams: {
        q?: string;
        lang?: string;
        sort?: string;
    }
}

// This is the main server component for the page
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Data is fetched on the server
  const snippets: Snippet[] = await getFilteredSnippets({ 
      query: searchParams?.q, 
      language: searchParams?.lang, 
      sort: searchParams?.sort 
  });

  return (
    // The client component receives the initial data as a prop
    <DashboardPageContent initialSnippets={snippets} />
  );
}
