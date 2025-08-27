import { getSnippetVersions, getSnippetById } from '@/app/actions';
import { SnippetView } from '@/components/codekeep/snippet-view';
import { notFound } from 'next/navigation';


export default async function SnippetPage({ params }: { params: { id: string } }) {
  const snippet = await getSnippetById(params.id);

  if (!snippet) {
    return notFound();
  }

  const versions = await getSnippetVersions(snippet._id);

  return (
    <SnippetView
      snippet={snippet}
      initialVersions={versions}
    />
  );
}
