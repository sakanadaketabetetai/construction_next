'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type Equipment = {
  id: string;
  name: string;
};

type MeasurementField = {
  id: string;
  name: string;
  type: 'NUMBER' | 'TEMPERATURE' | 'PRESSURE' | 'CURRENT' | 'VOLTAGE' | 'FLOW_RATE';
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  interval: number | null;
};

type InspectionTemplateItem = {
  id: string;
  itemName: string;
  description: string | null;
  required: boolean;
  measurementFields: MeasurementField[];
};

type InspectionTemplate = {
  id: string;
  name: string;
  description: string | null;
  items: InspectionTemplateItem[];
};

type Measurement = {
  fieldId: string;
  value: number;
  measuredAt: string;
};

type InspectionResult = {
  equipmentId: string;
  result: string;
  issues: string | null;
  measurements: Measurement[];
};

export default function ConstructionReportPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 工事情報を取得
        const projectResponse = await fetch(`/api/construction/${params.id}`);
        if (!projectResponse.ok) throw new Error('工事情報の取得に失敗しました');
        const projectData = await projectResponse.json();
        setEquipment(projectData.equipment || []);

        // テンプレート一覧を取得
        const templatesResponse = await fetch('/api/inspection-templates');
        if (!templatesResponse.ok) throw new Error('テンプレートの取得に失敗しました');
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template || null);
      
      if (template) {
        // 選択されたテンプレートに基づいて検査結果の初期状態を設定
        setInspectionResults(
          equipment.map(eq => ({
            equipmentId: eq.id,
            result: '',
            issues: null,
            measurements: template.items.flatMap(item => 
              item.measurementFields.map(field => ({
                fieldId: field.id,
                value: 0,
                measuredAt: new Date().toISOString(),
              }))
            ),
          }))
        );
      }
    }
  }, [selectedTemplateId, templates, equipment]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedTemplate) {
      setError('点検テンプレートを選択してください');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      constructionProjectId: params.id,
      content: formData.get('content'),
      topics: formData.get('topics'),
      templateId: selectedTemplate.id,
      inspectionResults,
    };

    try {
      const response = await fetch('/api/construction/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '工事報告書の登録に失敗しました');
      }

      router.push(`/construction/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '工事報告書の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = (equipmentId: string, fieldId: string) => {
    setInspectionResults(prev =>
      prev.map(result =>
        result.equipmentId === equipmentId
          ? {
              ...result,
              measurements: [
                ...result.measurements,
                {
                  fieldId,
                  value: 0,
                  measuredAt: new Date().toISOString(),
                },
              ],
            }
          : result
      )
    );
  };

  const handleRemoveMeasurement = (
    equipmentId: string,
    fieldId: string,
    measuredAt: string
  ) => {
    setInspectionResults(prev =>
      prev.map(result =>
        result.equipmentId === equipmentId
          ? {
              ...result,
              measurements: result.measurements.filter(
                m => !(m.fieldId === fieldId && m.measuredAt === measuredAt)
              ),
            }
          : result
      )
    );
  };

  const handleMeasurementChange = (
    equipmentId: string,
    fieldId: string,
    measuredAt: string,
    value: number
  ) => {
    setInspectionResults(prev =>
      prev.map(result =>
        result.equipmentId === equipmentId
          ? {
              ...result,
              measurements: result.measurements.map(m =>
                m.fieldId === fieldId && m.measuredAt === measuredAt
                  ? { ...m, value }
                  : m
              ),
            }
          : result
      )
    );
  };

  const handleResultChange = (equipmentId: string, field: 'result' | 'issues', value: string) => {
    setInspectionResults(prev =>
      prev.map(result =>
        result.equipmentId === equipmentId
          ? { ...result, [field]: value }
          : result
      )
    );
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

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/construction/${params.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          工事詳細に戻る
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">工事報告書作成</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              工事内容
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="content"
              name="content"
              rows={6}
              required
              placeholder="実施した工事の詳細な内容を記入してください"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="topics">
              工事のトピックス
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="topics"
              name="topics"
              rows={4}
              required
              placeholder="特記事項や重要なポイントを記入してください"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="templateId">
              点検テンプレート
            </label>
            <select
              id="templateId"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">テンプレートを選択してください</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">点検結果</h2>
              {equipment.map((eq) => (
                <div key={eq.id} className="mb-6 p-4 border rounded-lg">
                  <h3 className="font-bold mb-3">{eq.name}</h3>
                  
                  {selectedTemplate.items.map((item) => (
                    <div key={item.id} className="mb-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-semibold mb-2">{item.itemName}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}

                      {item.measurementFields.map((field) => {
                        const measurements = inspectionResults
                          .find(r => r.equipmentId === eq.id)
                          ?.measurements.filter(m => m.fieldId === field.id) || [];

                        return (
                          <div key={field.id} className="mb-4 p-4 bg-white rounded border">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium">
                                {field.name} ({field.unit})
                                {field.minValue !== null && field.maxValue !== null && (
                                  <span className="text-gray-500 text-xs ml-2">
                                    範囲: {field.minValue} ～ {field.maxValue}
                                  </span>
                                )}
                              </h5>
                              <button
                                type="button"
                                onClick={() => handleAddMeasurement(eq.id, field.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                計測値を追加
                              </button>
                            </div>

                            <div className="space-y-3">
                              {measurements.map((measurement) => (
                                <div
                                  key={measurement.measuredAt}
                                  className="flex items-center space-x-4"
                                >
                                  <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                      計測時刻: {formatDateTime(measurement.measuredAt)}
                                    </label>
                                    <input
                                      type="number"
                                      value={measurement.value}
                                      onChange={(e) => handleMeasurementChange(
                                        eq.id,
                                        field.id,
                                        measurement.measuredAt,
                                        parseFloat(e.target.value)
                                      )}
                                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                      step="any"
                                      required={item.required}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMeasurement(
                                      eq.id,
                                      field.id,
                                      measurement.measuredAt
                                    )}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    削除
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          点検結果
                        </label>
                        <textarea
                          value={inspectionResults.find(r => r.equipmentId === eq.id)?.result || ''}
                          onChange={(e) => handleResultChange(eq.id, 'result', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="点検結果を記入してください"
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          問題点・課題
                        </label>
                        <textarea
                          value={inspectionResults.find(r => r.equipmentId === eq.id)?.issues || ''}
                          onChange={(e) => handleResultChange(eq.id, 'issues', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="発見された問題点や課題を記入してください"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              type="submit"
              disabled={loading || !selectedTemplate || equipment.length === 0}
            >
              {loading ? '登録中...' : '報告書を登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}