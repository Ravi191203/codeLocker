import { getSnippets } from '../actions';
import { MainLayout } from '@/components/codekeep/main-layout';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const snippets = await getSnippets();
    
    return (
        <MainLayout initialSnippets={snippets}>
            {children}
        </MainLayout>
    )
}
