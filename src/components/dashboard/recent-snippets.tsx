import type { Snippet } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import Link from 'next/link';

export function RecentSnippets({ snippets }: { snippets: Snippet[] }) {
    if (snippets.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-8">
                No recent snippets.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {snippets.map(snippet => {
                const dateToFormat = snippet.updatedAt || snippet.createdAt;
                const date = dateToFormat ? new Date(dateToFormat) : null;
                const isValidDate = date && !isNaN(date.getTime());

                return (
                    <div key={snippet._id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{snippet.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize">{snippet.language}</Badge>
                               <span>
                                 {isValidDate ? `Updated ${formatDistanceToNow(date, { addSuffix: true })}` : 'Just now'}
                               </span>
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
