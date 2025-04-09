'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EquipmentStatus } from '@prisma/client';

type Equipment = {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  installationDate: Date | null;
  manufacturer: string | null;
  modelNumber: string | null;
  parts: EquipmentPart[];
};

type EquipmentPart = {
  id: string;
  partName: string;
  partNumber: string | null;
  manufacturer: string | null;
};

export default function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/equipment');
        if (!response.ok) throw new Error('Failed to fetch equipment');
        const data = await response.json();
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const getStatusText = (status: EquipmentStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return '稼働中';
      case 'UNDER_INSPECTION':
        return '点検中';
      case 'STANDBY':
        return '待機中';
      case 'MAINTENANCE':
        return 'メンテナンス中';
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800';
      case 'UNDER_INSPECTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'STANDBY':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-end p-4">
        <Link
          href="/equipment/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          新規設備登録
        </Link>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              設備名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              種別
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              メーカー
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              型番
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              部品数
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {equipment.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/equipment/${item.id}`} className="text-blue-600 hover:text-blue-900">
                  {item.name}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.manufacturer || '－'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.modelNumber || '－'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.parts.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}