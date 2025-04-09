'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type User = {
  id: string;
  email: string;
  fullName: string | null;
};

type RouteMember = {
  id: string;
  order: number;
  user: User;
};

type CirculationRoute = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: RouteMember[];
  createdBy: User;
};

export default function CirculationRouteList() {
  const [routes, setRoutes] = useState<CirculationRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/circulation-routes');
        if (!response.ok) throw new Error('Failed to fetch routes');
        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-end p-4">
        <Link
          href="/circulation-routes/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          新規ルート作成
        </Link>
      </div>

      <div className="overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ルート名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                説明
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                回覧メンバー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日時
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{route.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{route.description || '－'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {route.createdBy.fullName || route.createdBy.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {route.members
                      .sort((a, b) => a.order - b.order)
                      .map((member) => member.user.fullName || member.user.email)
                      .join(' → ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(route.createdAt).toLocaleString('ja-JP')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}