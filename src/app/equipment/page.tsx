import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import EquipmentList from '../../components/equipment/equipment-list';

export default async function EquipmentPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">設備管理</h1>
      <EquipmentList />
    </div>
  );
}