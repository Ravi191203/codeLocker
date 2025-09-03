
"use client"

import type { Snippet } from '@/lib/data';
import { SnippetList } from '@/components/codekeep/snippet-list';
import { useRouter } from 'next/navigation';

export default function HomePageContent({ initialSnippets }: { initialSnippets: Snippet[] }) {
  const router = useRouter();

  const handleSelectSnippet = (snippet: Snippet) => {
    // On the homepage, clicking a snippet should take you to the dashboard
    // where you can then view it in the dialog.
    router.push(`/dashboard?view=${snippet._id}`);
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
            onEdit={() => {}} // No edit on public page
            onDelete={() => {}} // No delete on public page
            isDashboard={false}
        />
      </div>
    </>
  );
}
