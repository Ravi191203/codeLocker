
import { Suspense } from 'react';
import { getSnippets } from '@/app/actions';
import HomePageContent from '@/components/codekeep/home-page-content';
import { Snippet } from '@/lib/data';

async function Snippets() {
    const snippets: Snippet[] = await getSnippets();
    return <HomePageContent initialSnippets={snippets} />;
}

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-4 md:p-8">Loading snippets...</div>}>
      <Snippets />
    </Suspense>
  )
}
