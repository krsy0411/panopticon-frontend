'use client';

import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Star from '../icons/Star';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: `${number}%` | string; // 예: '20%', '50%'
  sortable?: boolean; // 정렬 가능 여부
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  showFavorite?: boolean; // 즐겨찾기 열 표시 여부
  onFavoriteClick?: (row: T, index: number) => void; // 즐겨찾기 클릭 핸들러
  getRowId?: (row: T, index: number) => string; // Errors List 하이라이트
  onRowClick?: (row: T) => void; // 행 클릭 핸들러
  defaultSortDirection?: 'asc' | 'desc'; // 기본 정렬 방향
}

export default function Table<T>({
  columns,
  data,
  className = 'w-full',
  showFavorite = false,
  onFavoriteClick,
  getRowId, // Errors List 하이라이트
  onRowClick,
  defaultSortDirection = 'desc',
}: TableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  // 대부분의 APM 테이블은 최신순(내림차순) 기본값
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  // 행 클릭 핸들러
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

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

  // 정렬 핸들러
  const handleSort = (column: TableColumn<T>) => {
    if (column.sortable === false) return;

    if (sortField === column.key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(column.key);
      setSortDirection(defaultSortDirection); // Props의 기본값 존중
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            {/* 즐겨찾기 열 */}
            {showFavorite && (
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 w-12"
                aria-label="favorite"
              >
                <Star className="w-4 h-4 text-black" />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 select-none ${
                  column.sortable !== false ? 'cursor-pointer' : ''
                }`}
                style={{ width: column.width || 'auto' }}
                onClick={() => handleSort(column)}
              >
                <span className="flex items-center gap-1">
                  {column.header}
                  {column.sortable !== false &&
                    (sortField === column.key ? (
                      sortDirection === 'asc' ? (
                        <FiChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-gray-400" />
                      )
                    ) : (
                      <FiChevronUp className="w-4 h-4 text-gray-400" />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (showFavorite ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                데이터가 없습니다
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                id={getRowId ? getRowId(row, rowIndex) : undefined}
                className="border-b border-gray-200 hover:bg-gray-50 hover:cursor-pointer transition-colors"
                onClick={() => handleRowClick(row)}
              >
                {/* 즐겨찾기 셀 */}
                {showFavorite && (
                  <td className="px-4 py-3 text-sm">
                    <Star
                      onClick={(e) => {
                        e.stopPropagation(); // ⭐ Row 클릭 막기
                        onFavoriteClick?.(row, rowIndex); // ⭐ 토글 발생
                      }}
                      className={`w-4 h-4 cursor-pointer transition-colors ${
                        // ⭐ 즐겨찾기 상태별 색상 적용
                        (row as { isFavorite?: boolean }).isFavorite
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </td>
                )}

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
