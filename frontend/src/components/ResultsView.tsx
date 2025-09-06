'use client';

import React from 'react';

interface ResultsViewProps {
  url: string;
}

const getMediaType = (url: string): 'image' | 'audio' | 'video' | 'unknown' => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
    return 'image';
  }
  if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  }
  if (['mp4', 'webm', 'mov'].includes(extension)) {
    return 'video';
  }
  return 'unknown';
};

export function ResultsView({ url }: ResultsViewProps) {
  const mediaType = getMediaType(url);

  const renderMedia = () => {
    switch (mediaType) {
      case 'image':
        return <img src={url} alt="Generated content" style={{ maxWidth: '100%', borderRadius: '4px' }} />;
      case 'audio':
        return <audio controls src={url} style={{ width: '100%' }} />;
      case 'video':
        return <video controls src={url} style={{ maxWidth: '100%', borderRadius: '4px' }} />;
      default:
        return <p>Unsupported media type. <a href={url} download target="_blank" rel="noopener noreferrer">Download it here</a></p>;
    }
  };

  return (
    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
      <h4>Generated Media</h4>
      {renderMedia()}
      <div style={{ marginTop: '10px' }}>
        <a href={url} download target="_blank" rel="noopener noreferrer">
          <button style={{ padding: '8px 12px' }}>Download Asset</button>
        </a>
      </div>
    </div>
  );
}
