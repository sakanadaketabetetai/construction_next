import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import ConstructionList from '../../components/construction/new/construction-list';
import ConstructionSearch from '../../components/construction/new/construction-search';

export default async function ConstructionPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">工事管理</h1>
      <ConstructionSearch />
      <ConstructionList />
    </div>
  );
}