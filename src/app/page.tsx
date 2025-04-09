import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession();

  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-2xl font-bold">施設管理システム</h1>
        <p>ようこそ {session?.user?.email} さん</p>
      </div>
    </main>
  );
}