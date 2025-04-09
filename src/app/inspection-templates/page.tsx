import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import TemplateList from "@/components/inspection-templates/template-list";

export default async function InspectionTemplatesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">点検テンプレート管理</h1>
      <TemplateList />
    </div>
  );
}