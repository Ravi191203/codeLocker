import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { MainLayout } from '@/components/codekeep/main-layout';
import { getSession } from './actions';

export const metadata: Metadata = {
  title: 'CodeLocker',
  description: 'Your personal code snippet manager.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const { pathname } = new URL(process.env.APP_URL || 'http://localhost:3000');

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-2053494212350614"></meta>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2053494212350614"
     crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {session ? (
             <MainLayout>
              {children}
            </MainLayout>
          ) : (
            <>
            {isAuthPage ? children : <MainLayout>{children}</MainLayout>}
            </>
          )}
         
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
