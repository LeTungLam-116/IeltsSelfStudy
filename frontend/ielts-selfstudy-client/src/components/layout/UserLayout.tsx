import { type ReactNode } from 'react';
import Header from '../home/Header';

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[104px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 min-h-[calc(100vh-72px)]">
        {children}
      </main>
    </div>
  );
}

