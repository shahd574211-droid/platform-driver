'use client';

import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Sales
          </h1>
          <p className="text-gray-500 max-w-md">
            This section is under development. You will be able to manage
            sales here soon.
          </p>
        </div>
      </main>
    </div>
  );
}
