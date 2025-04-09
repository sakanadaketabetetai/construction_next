import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import Calendar from "@/components/daily-logs/calender";

export default async function DailyLogsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  // 現在の年月を YYYY-MM 形式で取得
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}-${month}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">業務日誌</h1>
      <Calendar yearMonth={yearMonth} />
    </div>
  );
}