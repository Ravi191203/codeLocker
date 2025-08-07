import { getSnippets } from './actions';
import { MainLayout } from '@/components/codekeep/main-layout';
import { redirect } from 'next/navigation';


export default async function Home() {
  const snippets = await getSnippets();
  
  return redirect('/dashboard');
}
