'use client';

import { useEffect, useState, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export interface Tag {
  key: string;
  value: string;
}

interface TagSearchBarProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  messageKeywords: string[];
  serviceNames: string[];
}

const TAG_KEYS = [
  { key: 'msg', label: '메시지' },
  { key: 'service', label: '서비스명' },
  { key: 'level', label: '로그 레벨' },
];

export default function TagSearchBar({
  tags,
  onTagsChange,
  keyword,
  onKeywordChange,
  messageKeywords,
  serviceNames,
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
  const filteredKeySuggestions = TAG_KEYS.filter((tag) =>
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
        min-h-[52px] px-4 py-2 rounded-xl border bg-white shadow-sm
        focus-within:ring-2 focus-within:ring-blue-300
      "
      >
        {tags.map((t, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm"
          >
            {t.key}:{t.value}
            <FiX
              className="cursor-pointer"
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
            placeholder="msg:error  service:order  trace:abcd  또는 일반 검색어 입력"
            className="flex-1 outline-none bg-transparent text-[15px]"
          />
        </div>
      </div>

      {/* 드롭다운 */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="
            absolute z-50 w-full mt-1
            bg-white shadow-lg border rounded-lg p-2
          "
        >
          {isKeyTyping ? (
            filteredKeySuggestions.map((tag) => (
              <div
                key={tag.key}
                className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => setInputValue(tag.key + ':')}
              >
                {tag.key} — {tag.label}
              </div>
            ))
          ) : (
            <>
              {valueSuggestions.map((v) => (
                <div
                  key={v}
                  className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => addTag(currentKey!, v)}
                >
                  {v}
                </div>
              ))}

              {valueSuggestions.length === 0 && (
                <div className="px-3 py-2 text-gray-500">검색 결과 없음</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
