'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Props {
  code: string;
  language: string;
}

export function CodeInspector({ code, language }: Props) {
  const value = useMemo(() => code, [code]);
  return (
    <div className="h-72 overflow-hidden rounded-lg border border-slate-800">
      <MonacoEditor
        theme="vs-dark"
        value={value}
        language={language}
        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
      />
    </div>
  );
}
