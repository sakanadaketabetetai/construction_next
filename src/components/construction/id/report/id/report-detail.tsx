'use client';

import Link from 'next/link';

type Report = {
  id: string;
  content: string;
  topics: string;
  createdAt: Date;
  constructionProject: {
    title: string;
  };
  createdBy: {
    email: string;
    fullName: string | null;
  };
  inspectionResults: {
    id: string;
    result: string;
    issues: string | null;
    equipment: {
      name: string;
    };
    measurements: {
      id: string;
      value: number;
      measuredAt: Date;
      measurementField: {
        name: string;
        type: string;
        unit: string;
      };
    }[];
  }[];
};

export default function ReportDetail({ report, projectId }: { report: Report; projectId: string }) {
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/construction/${projectId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          工事詳細に戻る
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {report.constructionProject.title}
          </h1>
          <p className="text-gray-600">
            報告者: {report.createdBy.fullName || report.createdBy.email}
          </p>
          <p className="text-gray-600">
            作成日時: {formatDateTime(report.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">工事内容</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {report.content}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">トピックス</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {report.topics}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">点検結果</h2>
            {report.inspectionResults.length > 0 ? (
              <div className="space-y-6">
                {report.inspectionResults.map((result) => (
                  <div key={result.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {result.equipment.name}
                    </h3>

                    {result.measurements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">計測値</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {result.measurements.map((measurement) => (
                            <div key={measurement.id} className="bg-white rounded-lg p-4 border">
                              <div className="font-medium text-gray-900">
                                {measurement.measurementField.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                種別: {getMeasurementTypeLabel(measurement.measurementField.type)}
                              </div>
                              <div className="mt-2">
                                <span className="text-lg font-semibold">
                                  {measurement.value} {measurement.measurementField.unit}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                計測時刻: {formatDateTime(measurement.measuredAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-gray-700">点検結果</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {result.result}
                        </p>
                      </div>
                      {result.issues && (
                        <div>
                          <h4 className="font-medium text-gray-700">問題点・課題</h4>
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {result.issues}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                点検結果は登録されていません
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}