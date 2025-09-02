import type { SVGProps } from 'react';

import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image 
        src="/images/monogram-sfai.png" 
        alt="SFAI Solutions Logo" 
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
