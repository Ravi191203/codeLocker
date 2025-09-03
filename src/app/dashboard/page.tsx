
import { Suspense } from 'react';
import DashboardPageContent from '@/components/codekeep/dashboard-page-content';
import { getFilteredSnippets } from '../actions';
import type { Snippet } from '@/lib/data';

type DashboardPageProps = {
    searchParams: {
        q?: string;
        lang?: string;
        sort?: string;
    }
}

async function Snippets({ query, language, sort }: { query?: string; language?: string; sort?: string }) {
    const snippets: Snippet[] = await getFilteredSnippets({ query, language, sort });
    return <DashboardPageContent initialSnippets={snippets} />;
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const { q, lang, sort } = searchParams;
  
  return (
    <Suspense fallback={<div className="p-4 md:p-8">Loading dashboard...</div>}>
      <Snippets query={q} language={lang} sort={sort} />
    </Suspense>
  );
}
