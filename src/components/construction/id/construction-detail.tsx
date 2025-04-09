'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProjectStatus } from '@prisma/client';

type Equipment = {
  id: string;
  name: string;
};

type Report = {
  id: string;
  content: string;
  topics: string;
  createdAt: Date;
  createdBy: {
    fullName: string | null;
    email: string;
  };
};

type ConstructionProject = {
  id: string;
  title: string;
  fiscalYear: number;
  targetEquipment: string;
  status: ProjectStatus;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  equipment: Equipment[];
  reports: Report[];
};

export default function ConstructionDetail({ project }: { project: ConstructionProject }) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return '継続中';
      case 'COMPLETED':
        return '完了';
      case 'DELAYED':
        return '遅延';
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/construction"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          工事一覧に戻る
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="mt-4">
              <Link
                href={`/construction/${project.id}/report`}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                工事報告書作成
              </Link>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
              project.status
            )}`}
          >
            {getStatusText(project.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">実施年度</dt>
                <dd className="mt-1 text-lg text-gray-900">{project.fiscalYear}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">点検対象設備</dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {project.equipment && project.equipment.length > 0 ? (
                    <div className="space-y-2">
                      {project.equipment.map((eq) => (
                        <Link
                          key={eq.id}
                          href={`/equipment/${eq.id}`}
                          className="block text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {eq.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    project.targetEquipment
                  )}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">開始日</dt>
                <dd className="mt-1 text-lg text-gray-900">{formatDate(project.startDate)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">完了日</dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {project.endDate ? formatDate(project.endDate) : '－'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">工事内容</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {project.description || '工事内容の記載はありません'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">工事報告書一覧</h2>
          {project.reports && project.reports.length > 0 ? (
            <div className="grid gap-4">
              {project.reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/construction/${project.id}/report/${report.id}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm">
                        報告者: {report.createdBy.fullName || report.createdBy.email}
                      </p>
                      <p className="text-gray-600 text-sm">
                        作成日時: {formatDateTime(report.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold text-gray-900">トピックス</h3>
                    <p className="text-gray-700 line-clamp-2">{report.topics}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">工事報告書はまだありません</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">更新履歴</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500">作成日時</dt>
              <dd className="mt-1 text-gray-900">{formatDateTime(project.createdAt)}</dd>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500">最終更新</dt>
              <dd className="mt-1 text-gray-900">{formatDateTime(project.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}