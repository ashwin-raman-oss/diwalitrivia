import { useState } from 'react';
import { assetUrl } from '../types';

/** An image that scales to fit its box and quietly disappears if the file is missing. */
export default function Picture({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return null;
  return (
    <div className="picture">
      <img src={assetUrl(src)} alt={alt} onError={() => setFailed(src)} />
    </div>
  );
}
