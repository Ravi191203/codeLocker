import { getSnippets } from './actions';
import { MainLayout } from '@/components/codekeep/main-layout';
import DashboardPage from './dashboard/page';

export default async function Home() {
  const snippets = await getSnippets();
  
  return (
    <MainLayout initialSnippets={snippets}>
      <DashboardPage />
    </MainLayout>
  );
}
