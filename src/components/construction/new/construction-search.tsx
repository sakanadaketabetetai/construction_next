'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConstructionSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [fiscalYear, setFiscalYear] = useState(searchParams.get('fiscalYear') || '');
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [targetEquipment, setTargetEquipment] = useState(searchParams.get('targetEquipment') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (fiscalYear) params.set('fiscalYear', fiscalYear);
    if (title) params.set('title', title);
    if (targetEquipment) params.set('targetEquipment', targetEquipment);
    if (status) params.set('status', status);

    router.push(`/construction?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fiscalYear">
            実施年度
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="fiscalYear"
            type="number"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            placeholder="2023"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            件名
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="工事件名"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetEquipment">
            点検対象設備
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="targetEquipment"
            type="text"
            value={targetEquipment}
            onChange={(e) => setTargetEquipment(e.target.value)}
            placeholder="設備名"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            状態
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">全て</option>
            <option value="ONGOING">継続中</option>
            <option value="COMPLETED">完了</option>
            <option value="DELAYED">遅延</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          検索
        </button>
      </div>
    </form>
  );
}