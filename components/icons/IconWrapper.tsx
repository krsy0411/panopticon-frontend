// 아이콘을 감싸주는 공통 레퍼(정렬 위해)

import React from 'react';

export default function IconWrapper({ children }: { children: React.ReactNode }) {
  return <span aria-hidden className="inline-flex">{children}</span>;
}
