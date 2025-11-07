'use client';

import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: `${number}%` | string; // 예: '20%', '50%'
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
}

export default function Table<T>({ columns, data, className = 'w-full' }: TableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 정렬 함수
  const getComparator = (key: keyof T, direction: 'asc' | 'desc') => {
    return (a: T, b: T) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      // 날짜 비교
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      // 문자열 비교
      return direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    };
  };

  // 정렬된 데이터 계산
  const sortedData = sortField ? [...data].sort(getComparator(sortField, sortDirection)) : data;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 select-none cursor-pointer"
                style={{ width: column.width || 'auto' }}
                onClick={() => {
                  if (sortField === column.key) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField(column.key);
                    setSortDirection('asc');
                  }
                }}
              >
                <span className="flex items-center gap-1">
                  {column.header}
                  {sortField === column.key ? (
                    sortDirection === 'asc' ? (
                      <FiChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-400" />
                    )
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                데이터가 없습니다
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-200 hover:bg-gray-50 hover:cursor-pointer transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap truncate"
                    style={{ width: column.width || 'auto' }}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
