'use client';

import { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiAlertOctagon, FiZap } from 'react-icons/fi';
import { BiBug, BiGridAlt } from 'react-icons/bi';
import SearchInput from '@/components/ui/SearchInput';
import { Header } from '@/components/common/app/Header';

export default function ApmPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [issuesSortField, setIssuesSortField] = useState<string | null>(null);
  const [issuesSortDirection, setIssuesSortDirection] = useState<'asc' | 'desc'>('asc');

  /* 정렬 핸들러 */
  //   서비스T
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 에러T
  const handleIssuesSort = (field: string) => {
    if (issuesSortField === field) {
      setIssuesSortDirection(issuesSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setIssuesSortField(field);
      setIssuesSortDirection('asc');
    }
  };

  /* 정렬 아이콘 컴포넌트 */
  const SortIcon = ({
    field,
    currentField,
    direction,
  }: {
    field: string;
    currentField: string | null;
    direction: 'asc' | 'desc';
  }) => {
    if (currentField !== field) {
      return (
        <div className="flex flex-col ml-1">
          <FiChevronUp className="w-3 h-3 -mb-1 text-gray-300" />
          <FiChevronDown className="w-3 h-3 text-gray-300" />
        </div>
      );
    }

    return direction === 'asc' ? (
      <FiChevronUp className="w-3 h-3 ml-1" />
    ) : (
      <FiChevronDown className="w-3 h-3 ml-1" />
    );
  };

  return (
    <>
      <Header />
      <div className="p-8 bg-gray-50 min-h-screen space-y-6">
        {/* APM Services */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <BiGridAlt className="w-5 h-5 text-purple-500" />
              <h3 className="text-gray-900 text-sm">APM Services</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">1h</span>
              <span className="text-gray-500 text-xs">Past 1 Hour</span>
            </div>

            {/* 검색창 + 필터 드롭다운 */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services"
                />
              </div>
              <select className="text-xs border border-gray-300 rounded px-3 py-2 text-gray-600">
                <option>env:sre-in-practice</option>
              </select>
            </div>
          </div>

          {/* Table Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-11 gap-2 text-xs text-gray-600 uppercase">
              <div className="col-span-1 flex items-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              <button
                type="button"
                onClick={() => handleSort('type')}
                className="col-span-2 flex items-center hover:text-gray-900 transition cursor-pointer"
              >
                Type
                <SortIcon field="type" currentField={sortField} direction={sortDirection} />
              </button>
              <button
                type="button"
                onClick={() => handleSort('service')}
                className="col-span-2 flex items-center hover:text-gray-900 transition cursor-pointer"
              >
                Service
                <SortIcon field="service" currentField={sortField} direction={sortDirection} />
              </button>
              <button
                type="button"
                onClick={() => handleSort('requests')}
                className="col-span-2 flex items-center hover:text-gray-900 transition cursor-pointer"
              >
                Requests
                <SortIcon field="requests" currentField={sortField} direction={sortDirection} />
              </button>
              <button
                type="button"
                onClick={() => handleSort('latency')}
                className="col-span-3 flex items-center hover:text-gray-900 transition cursor-pointer"
              >
                <FiZap className="w-3 h-3 mr-1" />
                P99 Latency
                <SortIcon field="latency" currentField={sortField} direction={sortDirection} />
              </button>
              <button
                type="button"
                onClick={() => handleSort('errorRate')}
                className="col-span-1 flex items-center hover:text-gray-900 transition cursor-pointer"
              >
                Error Rate
                <SortIcon field="errorRate" currentField={sortField} direction={sortDirection} />
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
            <FiAlertOctagon className="w-12 h-12 mb-3 text-purple-400" />
            <p className="text-gray-600 text-sm">No services match the filter</p>
            <p className="text-xs text-gray-400 mt-1">Please widen your filter</p>
          </div>
        </div>

        {/* Issues Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiBug className="w-4 h-4 text-purple-500" />
              <h3 className="text-gray-900 text-sm">Issues</h3>
            </div>
          </div>

          {/* Empty State */}
          <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
            <FiAlertOctagon className="w-12 h-12 mb-3 text-purple-400" />
            <p className="text-gray-600 text-sm">No matching results found</p>
          </div>
        </div>
      </div>
    </>
  );
}
