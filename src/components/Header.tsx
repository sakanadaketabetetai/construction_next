'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            施設管理システム
          </Link>
          
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/daily-logs" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  業務日誌
                </Link>
                <Link 
                  href="/construction" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  工事管理
                </Link>
                <Link 
                  href="/equipment" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  設備管理
                </Link>
                <Link 
                  href="/circulation-routes" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  回覧ルート
                </Link>
                <Link 
                  href="/inspection-templates" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  点検テンプレート
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">{session.user?.email}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    ログアウト
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                ログイン
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}