import { getSnippets } from './actions';
import { MainLayout } from '@/components/codekeep/main-layout';
import DashboardPage from './dashboard/page';
import { redirect } from 'next/navigation';


export default async function Home() {
  const snippets = await getSnippets();
  
  if (snippets.length > 0) {
    return (
      <MainLayout initialSnippets={snippets}>
        <DashboardPage />
      </MainLayout>
    );
  }

  return redirect('/dashboard');
}
