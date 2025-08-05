import { MainLayout } from '@/components/codekeep/main-layout';
import { getSnippets } from './actions';

export default async function Home() {
  const snippets = await getSnippets();
  return <MainLayout initialSnippets={snippets} />;
}
