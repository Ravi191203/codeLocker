import { getSharedSnippet } from '@/app/actions';
import { CodeBlock } from '@/components/codekeep/code-block';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

type SharedSnippetPageProps = {
    params: {
        shareId: string;
    }
}

export default async function SharedSnippetPage({ params }: SharedSnippetPageProps) {
    const snippet = await getSharedSnippet(params.shareId);

    if (!snippet) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4 sm:p-8">
            <Card className="w-full max-w-4xl shadow-2xl">
                <CardHeader className="p-6">
                    <CardTitle className="text-2xl">{snippet.name}</CardTitle>
                    <CardDescription>{snippet.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="h-[400px]">
                        <CodeBlock code={snippet.code} language={snippet.language} />
                    </div>
                </CardContent>
                <CardFooter className="p-6 bg-muted/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{snippet.language}</Badge>
                        {snippet.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Last updated on {format(new Date(snippet.updatedAt), "MMMM d, yyyy")}
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}