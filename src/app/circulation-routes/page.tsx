import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import CirculationRouteList from "@/components/circulation-routes/route-list";

export default async function CirculationRoutesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">回覧ルート管理</h1>
      <CirculationRouteList />
    </div>
  );
}