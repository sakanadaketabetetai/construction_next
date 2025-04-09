'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Equipment = {
  id: string;
  name: string;
  type: string;
};

export default function NewConstructionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/equipment');
        if (!response.ok) throw new Error('設備情報の取得に失敗しました');
        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        console.error('Error fetching equipment:', err);
      }
    };

    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;

    // 日付をISO形式に変換
    const startDate = startDateStr ? new Date(startDateStr + 'T00:00:00Z').toISOString() : null;
    const endDate = endDateStr ? new Date(endDateStr + 'T00:00:00Z').toISOString() : null;

    const data = {
      title: formData.get('title'),
      fiscalYear: parseInt(formData.get('fiscalYear') as string),
      targetEquipment: formData.get('targetEquipment'),
      status: formData.get('status'),
      description: formData.get('description'),
      startDate,
      endDate,
      equipmentIds: selectedEquipment,
    };

    try {
      const response = await fetch('/api/construction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '工事情報の登録に失敗しました');
      }

      router.push('/construction');
    } catch (err) {
      setError(err instanceof Error ? err.message : '工事情報の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentChange = (equipmentId: string) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新規工事登録</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            件名
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            name="title"
            type="text"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fiscalYear">
            実施年度
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="fiscalYear"
            name="fiscalYear"
            type="number"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetEquipment">
            点検対象設備
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="targetEquipment"
            name="targetEquipment"
            type="text"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            設備選択
          </label>
          <div className="max-h-60 overflow-y-auto border rounded p-4">
            {equipment.map((eq) => (
              <div key={eq.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`equipment-${eq.id}`}
                  checked={selectedEquipment.includes(eq.id)}
                  onChange={() => handleEquipmentChange(eq.id)}
                  className="mr-2"
                />
                <label htmlFor={`equipment-${eq.id}`} className="text-gray-700">
                  {eq.name} ({eq.type})
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            状態
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="status"
            name="status"
            required
          >
            <option value="ONGOING">継続中</option>
            <option value="COMPLETED">完了</option>
            <option value="DELAYED">遅延</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            工事内容
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
            開始日
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="startDate"
            name="startDate"
            type="date"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
            完了日
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="endDate"
            name="endDate"
            type="date"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
}