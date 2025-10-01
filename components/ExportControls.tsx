'use client';

import { useState } from 'react';

async function download(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ExportControls() {
  const [isDownloading, setIsDownloading] = useState(false);
  const handleExport = async (type: 'best' | 'scoreboard') => {
    if (!sessionStorage.getItem('megamind-session')) {
      console.warn('No active session stored');
    }
    const activeSession = sessionStorage.getItem('megamind-session');
    if (!activeSession) {
      alert('Start an orchestration before exporting.');
      return;
    }
    setIsDownloading(true);
    try {
      const endpoint =
        type === 'best'
          ? `/api/export/best?sessionId=${activeSession}`
          : `/api/export/scoreboard?sessionId=${activeSession}`;
      const filename =
        type === 'best' ? `${activeSession}-best-version.json` : `${activeSession}-scoreboard.csv`;
      await download(endpoint, filename);
    } catch (error) {
      console.error(error);
      alert('Export failed: ' + (error as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-background p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Exports</span>
        {isDownloading && <span className="text-xs text-muted-foreground">Downloading…</span>}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Downloads use the active session stored in your browser after kicking off an orchestration.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 rounded border px-3 py-2 hover:border-primary"
          onClick={() => handleExport('best')}
          disabled={isDownloading}
        >
          Best version JSON
        </button>
        <button
          className="flex-1 rounded border px-3 py-2 hover:border-primary"
          onClick={() => handleExport('scoreboard')}
          disabled={isDownloading}
        >
          Scoreboard CSV
        </button>
      </div>
    </div>
  );
}
