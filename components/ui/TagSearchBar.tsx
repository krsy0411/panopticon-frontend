'use client';

import { useEffect, useState, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import type { Tag, TagKey } from '@/types/tagSearchBar';

interface TagSearchBarProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  messageKeywords: string[];
  serviceNames: string[];
  tagKeys?: TagKey[];
  placeholder?: string;
}

const DEFAULT_TAG_KEYS: TagKey[] = [
  { key: 'msg', label: '메시지' },
  { key: 'service', label: '서비스명' },
  { key: 'level', label: '로그 레벨' },
];

const DEFAULT_PLACEHOLDER = 'msg:error  service:order  trace:abcd  또는 일반 검색어 입력';

export default function TagSearchBar({
  tags,
  onTagsChange,
  keyword,
  onKeywordChange,
  messageKeywords,
  serviceNames,
  tagKeys = DEFAULT_TAG_KEYS,
  placeholder = DEFAULT_PLACEHOLDER,
}: TagSearchBarProps) {
  const [inputValue, setInputValue] = useState(keyword);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const skipAutoClearRef = useRef(false);

  // 외부 keyword가 변경되면 입력창과 동기화
  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  // 입력창이 비어있는데도 keyword가 남아있다면 자동으로 초기화
  useEffect(() => {
    if (inputValue.trim() === '') {
      if (skipAutoClearRef.current) {
        skipAutoClearRef.current = false;
        return;
      }

      if (keyword !== '') {
        onKeywordChange('');
      }
    }
  }, [inputValue, keyword, onKeywordChange]);

  const isKeyTyping = !inputValue.includes(':');
  const currentKey = isKeyTyping ? null : inputValue.split(':')[0];
  const currentValue = isKeyTyping ? '' : inputValue.split(':')[1]?.toLowerCase() || '';

  // KEY 후보 필터링
  const filteredKeySuggestions = tagKeys.filter((tag) =>
    tag.key.startsWith(inputValue.toLowerCase()),
  );

  // VALUE 후보 동적 필터링
  const getFilteredValues = () => {
    let source: string[] = [];

    switch (currentKey) {
      case 'msg':
        source = messageKeywords;
        break;
      case 'service':
        source = serviceNames;
        break;
      case 'level':
        return ['ERROR', 'WARN', 'INFO', 'DEBUG'];
      default:
        source = [];
    }

    if (!currentValue) return source.slice(0, 20);

    return source.filter((v) => v.toLowerCase().includes(currentValue));
  };

  // 제안이 없으면 드롭다운을 숨겨 검색창 아래에 빈 여백이 생기지 않도록 함
  const valueSuggestions = getFilteredValues();
  const shouldShowDropdown =
    showDropdown && (isKeyTyping ? filteredKeySuggestions.length > 0 : true);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = (key: string, value: string) => {
    onTagsChange([...tags, { key, value }]);
    skipAutoClearRef.current = true;
    setInputValue('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    if (inputValue.includes(':')) {
      const [key, value] = inputValue.split(':');
      if (key && value) addTag(key, value);
    } else {
      onKeywordChange(inputValue);
    }
  };

  return (
    <div className="relative w-full">
      <div
        className="
        flex items-center flex-wrap gap-2 w-full
        min-h-[52px] px-4 py-2 rounded-lg bg-white shadow-sm
        focus-within:ring-2 focus-within:ring-blue-200 transition-all
      "
      >
        {tags.map((t, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-sm font-medium"
          >
            {t.key}:{t.value}
            <FiX
              className="cursor-pointer hover:text-blue-800 transition-colors"
              onClick={() => onTagsChange(tags.filter((_, i) => i !== idx))}
            />
          </div>
        ))}

        {/* 검색 input */}
        <div className="flex items-center flex-1">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 드롭다운 */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="
            absolute z-50 w-full mt-2
            bg-white shadow-md rounded-lg p-1
          "
        >
          {isKeyTyping ? (
            filteredKeySuggestions.map((tag) => (
              <div
                key={tag.key}
                className="px-3 py-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors text-sm text-gray-700"
                onClick={() => setInputValue(tag.key + ':')}
              >
                <span className="font-medium text-blue-600">{tag.key}</span> —{' '}
                <span className="text-gray-600">{tag.label}</span>
              </div>
            ))
          ) : (
            <>
              {valueSuggestions.map((v) => (
                <div
                  key={v}
                  className="px-3 py-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors text-sm text-gray-700"
                  onClick={() => addTag(currentKey!, v)}
                >
                  {v}
                </div>
              ))}

              {valueSuggestions.length === 0 && (
                <div className="px-3 py-2 text-gray-400 text-sm">검색 결과 없음</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
