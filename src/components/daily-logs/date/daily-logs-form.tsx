'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ConstructionProject = {
  id: string;
  title: string;
};

type DailyLogEntry = {
  constructionProjectId: string;
  workStatus: 'IN_PROGRESS' | 'COMPLETED';
  workDescription: string;
  nextWorkPlan: string;
};

type DailyLog = {
  id: string;
  date: string;
  nextWorkDate: string;
  isHoliday: boolean;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED';
  entries: DailyLogEntry[];
};

type CirculationRoute = {
  id: string;
  name: string;
  description: string | null;
  members: {
    user: {
      fullName: string | null;
      email: string;
    };
    order: number;
  }[];
};

type Circulation = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment: string | null;
  approver: {
    fullName: string | null;
    email: string;
  };
};

export default function DailyLogForm({ date }: { date: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ongoingProjects, setOngoingProjects] = useState<ConstructionProject[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [nextWorkDate, setNextWorkDate] = useState('');
  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [circulationRoutes, setCirculationRoutes] = useState<CirculationRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [circulations, setCirculations] = useState<Circulation[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchDailyLog = async () => {
      try {
        const response = await fetch(`/api/daily-logs/${date}`);
        if (!response.ok) throw new Error('業務日誌の取得に失敗しました');
        const data = await response.json();

        if (data.exists) {
          setDailyLog(data.dailyLog);
          setIsHoliday(data.dailyLog.isHoliday);
          setNextWorkDate(new Date(data.dailyLog.nextWorkDate).toISOString().split('T')[0]);
          setEntries(data.dailyLog.entries);
          setCirculations(data.dailyLog.circulations || []);
          const projects = data.dailyLog.entries.map((entry: any) => ({
            id: entry.constructionProject.id,
            title: entry.constructionProject.title,
          }));
          setOngoingProjects(projects);
        } else {
          setOngoingProjects(data.ongoingProjects);
          setEntries(
            data.ongoingProjects.map((project: ConstructionProject) => ({
              constructionProjectId: project.id,
              workStatus: 'IN_PROGRESS',
              workDescription: '',
              nextWorkPlan: '',
            }))
          );
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          setNextWorkDate(nextDate.toISOString().split('T')[0]);
        }
      } catch (err) {
        console.error('Error fetching daily log:', err);
        setError(err instanceof Error ? err.message : '業務日誌の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    const fetchCirculationRoutes = async () => {
      try {
        const response = await fetch('/api/circulation-routes');
        if (!response.ok) throw new Error('回覧ルートの取得に失敗しました');
        const data = await response.json();
        setCirculationRoutes(data);
      } catch (err) {
        console.error('Error fetching circulation routes:', err);
      }
    };

    fetchDailyLog();
    fetchCirculationRoutes();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const data = {
      nextWorkDate,
      isHoliday,
      entries,
    };

    try {
      const response = await fetch(`/api/daily-logs/${date}`, {
        method: dailyLog ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '業務日誌の保存に失敗しました');
      }

      // 保存後のデータを再取得して状態を更新
      const result = await response.json();
      setDailyLog(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '業務日誌の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleStartCirculation = async () => {
    if (!dailyLog) {
      setError('先に業務日誌を保存してください');
      return;
    }

    if (!selectedRouteId) {
      setError('回覧ルートを選択してください');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/daily-logs/${date}/circulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId: selectedRouteId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '回覧の開始に失敗しました');
      }

      router.push('/daily-logs');
    } catch (err) {
      setError(err instanceof Error ? err.message : '回覧の開始に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (status: 'APPROVED' | 'REJECTED') => {
    setSaving(true);
    setError(null);

    try {
      // 承認時に完了した工事のステータスを更新
      if (status === 'APPROVED') {
        const completedEntries = entries.filter(entry => entry.workStatus === 'COMPLETED');
        for (const entry of completedEntries) {
          await fetch(`/api/construction/${entry.constructionProjectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'COMPLETED',
            }),
          });
        }
      }

      const response = await fetch(`/api/daily-logs/${date}/circulation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '承認処理に失敗しました');
      }

      router.push('/daily-logs');
    } catch (err) {
      setError(err instanceof Error ? err.message : '承認処理に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleEntryChange = (index: number, field: keyof DailyLogEntry, value: string) => {
    setEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
        // 完了の場合は次回作業予定を空にする
        ...(field === 'workStatus' && value === 'COMPLETED' ? { nextWorkPlan: '' } : {}),
      };
      return newEntries;
    });
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return '下書き';
      case 'IN_REVIEW':
        return '確認中';
      case 'APPROVED':
        return '承認済み';
      case 'PENDING':
        return '承認待ち';
      case 'REJECTED':
        return '却下';
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isEditable = !dailyLog || dailyLog.status === 'DRAFT';
  const showCirculationButton = dailyLog && dailyLog.status === 'DRAFT';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isHoliday}
                  onChange={(e) => setIsHoliday(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                  disabled={!isEditable}
                />
                <span className="ml-2 text-gray-700">休日</span>
              </label>
              {dailyLog?.status && (
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeColor(dailyLog.status)}`}>
                  {getStatusText(dailyLog.status)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            次回作業予定日
          </label>
          <input
            type="date"
            value={nextWorkDate}
            onChange={(e) => setNextWorkDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!isEditable}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">本日の作業実績</h2>
          {entries.map((entry, index) => {
            const project = ongoingProjects.find(p => p.id === entry.constructionProjectId);
            if (!project) return null;

            return (
              <div key={index} className="border-t pt-6 first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{project.title}</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    状態
                  </label>
                  <select
                    value={entry.workStatus}
                    onChange={(e) => handleEntryChange(index, 'workStatus', e.target.value as 'IN_PROGRESS' | 'COMPLETED')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditable}
                  >
                    <option value="IN_PROGRESS">継続中</option>
                    <option value="COMPLETED">完了</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    作業内容
                  </label>
                  <textarea
                    value={entry.workDescription}
                    onChange={(e) => handleEntryChange(index, 'workDescription', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                    disabled={!isEditable}
                  />
                </div>

                {entry.workStatus === 'IN_PROGRESS' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      翌日の作業予定
                    </label>
                    <textarea
                      value={entry.nextWorkPlan}
                      onChange={(e) => handleEntryChange(index, 'nextWorkPlan', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      required
                      disabled={!isEditable}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showCirculationButton && (
          <div className="mb-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">回覧設定</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                回覧ルート
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">回覧ルートを選択</option>
                {circulationRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              {selectedRouteId && (
                <div className="mt-2 text-sm text-gray-600">
                  回覧順序: {
                    circulationRoutes
                      .find(route => route.id === selectedRouteId)
                      ?.members
                      .sort((a, b) => a.order - b.order)
                      .map(member => member.user.fullName || member.user.email)
                      .join(' → ')
                  }
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleStartCirculation}
              disabled={saving || !selectedRouteId}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              回覧を開始
            </button>
          </div>
        )}

        {dailyLog?.status === 'IN_REVIEW' && circulations.length > 0 && (
          <div className="mb-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">回覧状況</h2>
            <div className="space-y-4">
              {circulations.map((circulation) => (
                <div key={circulation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{circulation.approver.fullName || circulation.approver.email}</div>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(circulation.status)}`}>
                      {getStatusText(circulation.status)}
                    </div>
                    {circulation.comment && (
                      <div className="mt-2 text-sm text-gray-600">{circulation.comment}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {circulations.some(c => c.status === 'PENDING') && (
              <div className="mt-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    コメント
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleApprove('APPROVED')}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    承認
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove('REJECTED')}
                    disabled={saving}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    却下
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Link
            href="/daily-logs"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            キャンセル
          </Link>
          {isEditable && (
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}