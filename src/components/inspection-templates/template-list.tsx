'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type MeasurementField = {
  id: string;
  name: string;
  type: 'NUMBER' | 'TEMPERATURE' | 'PRESSURE' | 'CURRENT' | 'VOLTAGE' | 'FLOW_RATE';
  unit: string;
  minValue: number | null;
  maxValue: number | null;
};

type InspectionTemplateItem = {
  id: string;
  itemName: string;
  description: string | null;
  order: number;
  required: boolean;
  measurementFields: MeasurementField[];
};

type InspectionTemplate = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  items: InspectionTemplateItem[];
  createdBy: {
    email: string;
    fullName: string | null;
  };
};

const getMeasurementTypeLabel = (type: string) => {
  const types = {
    NUMBER: '数値',
    TEMPERATURE: '温度',
    PRESSURE: '圧力',
    CURRENT: '電流',
    VOLTAGE: '電圧',
    FLOW_RATE: '流量',
  };
  return types[type as keyof typeof types] || type;
};

export default function TemplateList() {
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/inspection-templates');
        if (!response.ok) throw new Error('テンプレートの取得に失敗しました');
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err instanceof Error ? err.message : 'テンプレートの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-end p-4">
        <Link
          href="/inspection-templates/new"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          新規テンプレート作成
        </Link>
      </div>

      <div className="overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                テンプレート名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                説明
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                点検項目数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日時
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <>
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/inspection-templates/${template.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {template.description || '－'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {template.createdBy.fullName || template.createdBy.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {template.items.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {expandedTemplate === template.id ? '閉じる' : '表示'}
                    </button>
                  </td>
                </tr>
                {expandedTemplate === template.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        {template.items.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4 bg-white">
                            <div className="mb-2">
                              <h3 className="font-bold text-lg">{item.itemName}</h3>
                              {item.description && (
                                <p className="text-gray-600 mt-1">{item.description}</p>
                              )}
                              <div className="flex items-center mt-2 space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${item.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {item.required ? '必須' : '任意'}
                                </span>
                              </div>
                            </div>

                            {item.measurementFields.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">計測項目</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {item.measurementFields.map((field) => (
                                    <div key={field.id} className="border rounded p-3 bg-gray-50">
                                      <div className="font-medium">{field.name}</div>
                                      <div className="text-sm text-gray-600">
                                        <div>種別: {getMeasurementTypeLabel(field.type)}</div>
                                        <div>単位: {field.unit}</div>
                                        {(field.minValue !== null || field.maxValue !== null) && (
                                          <div>
                                            範囲: {field.minValue !== null ? field.minValue : '－'} ～ {field.maxValue !== null ? field.maxValue : '－'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}