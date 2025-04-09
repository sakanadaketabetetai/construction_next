'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DailyLog = {
  id: string;
  date: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED';
  isHoliday: boolean;
  createdBy: {
    email: string;
    fullName: string | null;
  };
};

export default function Calendar({ yearMonth: initialYearMonth }: { yearMonth: string }) {
  const [yearMonth, setYearMonth] = useState(initialYearMonth);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyLogs = async () => {
      try {
        const response = await fetch(`/api/daily-logs/month/${yearMonth}`);
        if (!response.ok) throw new Error('業務日誌の取得に失敗しました');
        const data = await response.json();
        setDailyLogs(data);
      } catch (err) {
        console.error('Error fetching daily logs:', err);
        setError(err instanceof Error ? err.message : '業務日誌の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (yearMonth) {
      fetchDailyLogs();
    }
  }, [yearMonth]);

  // yearMonthが空の場合は何も表示しない
  if (!yearMonth) {
    return null;
  }

  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month)) {
    return <div>Invalid date format</div>;
  }

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return '下書き';
      case 'IN_REVIEW':
        return '確認中';
      case 'APPROVED':
        return '承認済';
      default:
        return status;
    }
  };

  const changeMonth = (offset: number) => {
    const date = new Date(year, month - 1 + offset, 1);
    const newYear = date.getFullYear();
    const newMonth = date.getMonth() + 1;
    setYearMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // 現在の月と翌月のみ編集可能
  const canEdit = (date: string) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const targetDate = new Date(date);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    return (
      (targetYear === currentYear && targetMonth === currentMonth) ||
      (targetYear === currentYear && targetMonth === currentMonth + 1) ||
      (targetYear === currentYear + 1 && targetMonth === 0 && currentMonth === 11)
    );
  };

  const weeks = [];
  let days = [];
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // 前月の日付を埋める
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<td key={`empty-${i}`} className="p-2 border border-gray-200"></td>);
  }

  // 当月の日付を埋める
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dailyLog = dailyLogs.find(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === day;
    });
    const isToday = new Date().toISOString().split('T')[0] === date;
    const isEditable = canEdit(date);

    days.push(
      <td key={day} className={`p-2 border ${isToday ? 'bg-blue-50' : ''}`}>
        <div className="min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="font-semibold">{day}</span>
            {isEditable && !dailyLog && (
              <Link
                href={`/daily-logs/${date}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                作成
              </Link>
            )}
          </div>
          {dailyLog && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(dailyLog.status)}`}>
                  {getStatusText(dailyLog.status)}
                </span>
                {dailyLog.isHoliday && (
                  <span className="text-xs text-red-600">休日</span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                作成者: {dailyLog.createdBy.fullName || dailyLog.createdBy.email}
              </div>
              <Link
                href={`/daily-logs/${date}`}
                className="block text-blue-600 hover:text-blue-800 text-sm underline"
              >
                {isEditable && dailyLog.status === 'DRAFT' ? '編集' : '詳細を見る'}
              </Link>
            </div>
          )}
        </div>
      </td>
    );

    if (days.length === 7) {
      weeks.push(<tr key={weeks.length}>{days}</tr>);
      days = [];
    }
  }

  // 残りの日付を埋める
  if (days.length > 0) {
    while (days.length < 7) {
      days.push(<td key={`empty-end-${days.length}`} className="p-2 border border-gray-200"></td>);
    }
    weeks.push(<tr key={weeks.length}>{days}</tr>);
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => changeMonth(-1)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          前月
        </button>
        <h2 className="text-xl font-bold">
          {year}年{month}月
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          翌月
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              {weekdays.map((day, index) => (
                <th
                  key={day}
                  className={`p-2 border border-gray-200 text-center ${
                    index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''
                  }`}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{weeks}</tbody>
        </table>
      </div>
    </div>
  );
}