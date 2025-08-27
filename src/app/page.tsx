import { Suspense } from 'react';
import { getSnippets } from '@/app/actions';
import HomePageContent from '@/components/codekeep/home-page-content';

export default async function Page() {
  const snippets = await getSnippets();
  
  return (
    <Suspense>
      <HomePageContent initialSnippets={snippets} />
    </Suspense>
  )
}
