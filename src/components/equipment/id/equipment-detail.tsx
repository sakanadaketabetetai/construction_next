'use client';

import { useState } from 'react';
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
  inspections: EquipmentInspection[];
  constructionProjects: ConstructionProject[];
  inspectionResults: InspectionResult[];
};

type EquipmentPart = {
  id: string;
  partName: string;
  partNumber: string | null;
  manufacturer: string | null;
  supplier: string | null;
  lastOrderedDate: Date | null;
  lastOrderedPrice: number | null;
  notes: string | null;
};

type EquipmentInspection = {
  id: string;
  inspectionDate: Date;
  findings: string | null;
  issues: string | null;
  inspector: {
    fullName: string | null;
    email: string;
  };
};

type ConstructionProject = {
  id: string;
  title: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  reports: {
    id: string;
    inspectionResults: {
      id: string;
      result: string;
      issues: string | null;
    }[];
  }[];
};

type InspectionResult = {
  id: string;
  result: string;
  issues: string | null;
  report: {
    id: string;
    constructionProject: {
      id: string;
      title: string;
    };
  };
};

export default function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [showAddInspectionForm, setShowAddInspectionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (date: Date | null) => {
    if (!date) return '未設定';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleAddPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      partName: formData.get('partName'),
      partNumber: formData.get('partNumber') || null,
      manufacturer: formData.get('manufacturer') || null,
      supplier: formData.get('supplier') || null,
      notes: formData.get('notes') || null,
    };

    try {
      const response = await fetch(`/api/equipment/${equipment.id}/parts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('部品の登録に失敗しました');
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '部品の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInspection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      inspectionDate: formData.get('inspectionDate'),
      findings: formData.get('findings') || null,
      issues: formData.get('issues') || null,
    };

    try {
      const response = await fetch(`/api/equipment/${equipment.id}/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('点検記録の登録に失敗しました');
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '点検記録の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/equipment"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          設備一覧に戻る
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-gray-600 mt-2">{equipment.type}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
              equipment.status
            )}`}
          >
            {getStatusText(equipment.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">メーカー</dt>
                <dd className="mt-1 text-lg text-gray-900">{equipment.manufacturer || '－'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">型番</dt>
                <dd className="mt-1 text-lg text-gray-900">{equipment.modelNumber || '－'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">設置日</dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {formatDate(equipment.installationDate)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">部品リスト</h2>
              <button
                onClick={() => setShowAddPartForm(!showAddPartForm)}
                className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded"
              >
                部品を追加
              </button>
            </div>

            {showAddPartForm && (
              <form onSubmit={handleAddPart} className="mb-4 p-4 bg-white rounded-lg shadow">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partName">
                    部品名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="partName"
                    name="partName"
                    type="text"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partNumber">
                    部品番号
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="partNumber"
                    name="partNumber"
                    type="text"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manufacturer">
                    メーカー
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="manufacturer"
                    name="manufacturer"
                    type="text"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">
                    仕入先
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="supplier"
                    name="supplier"
                    type="text"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                    備考
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="notes"
                    name="notes"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {loading ? '登録中...' : '登録'}
                </button>
              </form>
            )}

            {equipment.parts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">部品名</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">部品番号</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">メーカー</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {equipment.parts.map((part) => (
                      <tr key={part.id}>
                        <td className="px-4 py-2">{part.partName}</td>
                        <td className="px-4 py-2">{part.partNumber || '－'}</td>
                        <td className="px-4 py-2">{part.manufacturer || '－'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">登録されている部品はありません</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">点検履歴</h2>
            <button
              onClick={() => setShowAddInspectionForm(!showAddInspectionForm)}
              className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded"
            >
              点検記録を追加
            </button>
          </div>

          {showAddInspectionForm && (
            <form onSubmit={handleAddInspection} className="mb-4 p-4 bg-white rounded-lg shadow">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inspectionDate">
                  点検日 <span className="text-red-500">*</span>
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="inspectionDate"
                  name="inspectionDate"
                  type="date"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="findings">
                  所見
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="findings"
                  name="findings"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="issues">
                  問題点
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="issues"
                  name="issues"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </form>
          )}

          {equipment.inspections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">点検日</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">点検者</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">所見</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">問題点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {equipment.inspections.map((inspection) => (
                    <tr key={inspection.id}>
                      <td className="px-4 py-2">{formatDate(inspection.inspectionDate)}</td>
                      <td className="px-4 py-2">{inspection.inspector.fullName || inspection.inspector.email}</td>
                      <td className="px-4 py-2">{inspection.findings || '－'}</td>
                      <td className="px-4 py-2">{inspection.issues || '－'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">点検履歴はありません</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">工事履歴</h2>
          {equipment.constructionProjects.length > 0 ? (
            <div className="space-y-4">
              {equipment.constructionProjects.map((project) => (
                <div key={project.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/construction/${project.id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {project.title}
                    </Link>
                    <span className={`px-2 py-1 text-sm rounded-full ${getStatusBadgeColor(project.status as EquipmentStatus)}`}>
                      {getStatusText(project.status as EquipmentStatus)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    期間: {formatDate(project.startDate)} ～ {project.endDate ? formatDate(project.endDate) : '進行中'}
                  </p>
                  {project.reports.map((report) => (
                    report.inspectionResults.map((result) => (
                      <div key={result.id} className="mt-2 pl-4 border-l-2 border-gray-200">
                        <p className="text-gray-700">{result.result}</p>
                        {result.issues && (
                          <p className="text-red-600 mt-1">問題点: {result.issues}</p>
                        )}
                      </div>
                    ))
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">工事履歴はありません</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">点検結果履歴</h2>
          {equipment.inspectionResults.length > 0 ? (
            <div className="space-y-4">
              {equipment.inspectionResults.map((result) => (
                <div key={result.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <Link
                    href={`/construction/${result.report.constructionProject.id}/report/${result.report.id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {result.report.constructionProject.title}
                  </Link>
                  <div className="mt-2">
                    <p className="text-gray-700">{result.result}</p>
                    {result.issues && (
                      <p className="text-red-600 mt-1">問題点: {result.issues}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">点検結果履歴はありません</p>
          )}
        </div>
      </div>
    </div>
  );
}