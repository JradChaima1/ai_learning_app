'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    });
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm transition-colors"
    >
      Sign Out
    </button>
  );
} 