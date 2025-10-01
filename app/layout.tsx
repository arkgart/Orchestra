import './globals.css';
import 'sonner/dist/styles.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export const metadata: Metadata = {
  title: 'MEGAMIND ULTRA Super-Orchestrator',
  description: 'Autonomous multi-agent, multi-tool super orchestrator for complex tasks.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
