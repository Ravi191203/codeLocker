
"use client"

import type { Snippet } from '@/lib/data';
import { SnippetList } from '@/components/codekeep/snippet-list';
import { useRouter } from 'next/navigation';

export default function HomePageContent({ initialSnippets }: { initialSnippets: Snippet[] }) {
  const router = useRouter();

  const handleSelectSnippet = (snippet: Snippet) => {
    router.push(`/dashboard/snippet/${snippet._id}`);
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome to CodeKeep</h1>
            <p className="text-lg text-muted-foreground mt-2">Your personal code snippet manager. Browse all snippets below.</p>
        </div>
         <SnippetList 
            snippets={initialSnippets} 
            onSelectSnippet={handleSelectSnippet}
            onEdit={() => {}}
            onDelete={() => {}}
            isDashboard={false}
        />
      </div>
    </>
  );
}
