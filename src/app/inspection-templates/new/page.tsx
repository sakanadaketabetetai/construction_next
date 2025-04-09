'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type MeasurementField = {
  name: string;
  type: 'NUMBER' | 'TEMPERATURE' | 'PRESSURE' | 'CURRENT' | 'VOLTAGE' | 'FLOW_RATE';
  unit: string;
  minValue: number | null;
  maxValue: number | null;
};

type InspectionItem = {
  itemName: string;
  description: string;
  required: boolean;
  measurementFields: MeasurementField[];
};

const MEASUREMENT_TYPES = [
  { value: 'NUMBER', label: '数値' },
  { value: 'TEMPERATURE', label: '温度' },
  { value: 'PRESSURE', label: '圧力' },
  { value: 'CURRENT', label: '電流' },
  { value: 'VOLTAGE', label: '電圧' },
  { value: 'FLOW_RATE', label: '流量' },
] as const;

const DEFAULT_UNITS = {
  NUMBER: '',
  TEMPERATURE: '℃',
  PRESSURE: 'MPa',
  CURRENT: 'A',
  VOLTAGE: 'V',
  FLOW_RATE: 'm³/h',
};

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InspectionItem[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (items.length === 0) {
      setError('点検項目を追加してください');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      items: items.map(item => ({
        ...item,
        measurementFields: item.measurementFields.map(field => ({
          ...field,
          minValue: field.minValue === null ? null : Number(field.minValue),
          maxValue: field.maxValue === null ? null : Number(field.maxValue),
        })),
      })),
    };

    try {
      const response = await fetch('/api/inspection-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テンプレートの作成に失敗しました');
      }

      router.push('/inspection-templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テンプレートの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { 
      itemName: '', 
      description: '', 
      required: true,
      measurementFields: [],
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InspectionItem, value: string | boolean) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return newItems;
    });
  };

  const handleAddMeasurementField = (itemIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[itemIndex].measurementFields.push({
        name: '',
        type: 'NUMBER',
        unit: '',
        minValue: null,
        maxValue: null,
      });
      return newItems;
    });
  };

  const handleRemoveMeasurementField = (itemIndex: number, fieldIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[itemIndex].measurementFields.splice(fieldIndex, 1);
      return newItems;
    });
  };

  const handleMeasurementFieldChange = (
    itemIndex: number,
    fieldIndex: number,
    field: keyof MeasurementField,
    value: string | number | null
  ) => {
    setItems(prev => {
      const newItems = [...prev];
      const measurementField = newItems[itemIndex].measurementFields[fieldIndex];
      
      if (field === 'type') {
        // 計測タイプが変更された場合、デフォルトの単位を設定
        measurementField.type = value as MeasurementField['type'];
        measurementField.unit = DEFAULT_UNITS[value as keyof typeof DEFAULT_UNITS];
      } else {
        (measurementField[field] as any) = value;
      }
      
      return newItems;
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/inspection-templates"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          テンプレート一覧に戻る
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">新規点検テンプレート作成</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              テンプレート名 <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="name"
              name="name"
              type="text"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              説明
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="description"
              name="description"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-gray-700 text-sm font-bold">
                点検項目
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded"
              >
                項目を追加
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, itemIndex) => (
                <div key={itemIndex} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">項目 {itemIndex + 1}</h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => moveItem(itemIndex, 'up')}
                        disabled={itemIndex === 0}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(itemIndex, 'down')}
                        disabled={itemIndex === items.length - 1}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(itemIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      項目名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(itemIndex, 'itemName', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      説明
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.required}
                        onChange={(e) => handleItemChange(itemIndex, 'required', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">必須項目</span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-700">計測項目</h4>
                      <button
                        type="button"
                        onClick={() => handleAddMeasurementField(itemIndex)}
                        className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded"
                      >
                        計測項目を追加
                      </button>
                    </div>

                    <div className="space-y-4">
                      {item.measurementFields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="border rounded p-4 bg-white">
                          <div className="flex justify-between items-start mb-4">
                            <h5 className="font-bold text-sm">計測項目 {fieldIndex + 1}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveMeasurementField(itemIndex, fieldIndex)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              削除
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                項目名 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => handleMeasurementFieldChange(itemIndex, fieldIndex, 'name', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                計測タイプ <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={field.type}
                                onChange={(e) => handleMeasurementFieldChange(itemIndex, fieldIndex, 'type', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                {MEASUREMENT_TYPES.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                単位 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={field.unit}
                                onChange={(e) => handleMeasurementFieldChange(itemIndex, fieldIndex, 'unit', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                最小値
                              </label>
                              <input
                                type="number"
                                value={field.minValue ?? ''}
                                onChange={(e) => handleMeasurementFieldChange(
                                  itemIndex,
                                  fieldIndex,
                                  'minValue',
                                  e.target.value ? Number(e.target.value) : null
                                )}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="any"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                最大値
                              </label>
                              <input
                                type="number"
                                value={field.maxValue ?? ''}
                                onChange={(e) => handleMeasurementFieldChange(
                                  itemIndex,
                                  fieldIndex,
                                  'maxValue',
                                  e.target.value ? Number(e.target.value) : null
                                )}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="any"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}