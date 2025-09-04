
import { getSnippetById } from '@/app/actions';
import { notFound } from 'next/navigation';
import { SnippetPageView } from '@/components/codekeep/snippet-page-view';


type SnippetPageProps = {
    params: {
        id: string;
    }
}

export default async function SnippetPage({ params }: SnippetPageProps) {
    const snippet = await getSnippetById(params.id);

    if (!snippet) {
        notFound();
    }

    return <SnippetPageView initialSnippet={snippet} />;
}
