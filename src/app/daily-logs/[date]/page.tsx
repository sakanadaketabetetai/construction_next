import { getServerSession } from "next-auth/next";
import { redirect, notFound } from 'next/navigation';
import DailyLogForm from "@/components/daily-logs/date/daily-logs-form";

export default async function DailyLogPage({
  params, 
}: {
  params: { date: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  const context = await params;
  const { date } = context;

  // 日付の形式をバリデーション（YYYY-MM-DD）
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date || !dateRegex.test(date)) {
    notFound();
  }

  // 日付が有効かチェック
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    notFound();
  }

  const formattedDate = parsedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{formattedDate}の業務日誌</h1>
      <DailyLogForm date={date} />
    </div>
  );
}
