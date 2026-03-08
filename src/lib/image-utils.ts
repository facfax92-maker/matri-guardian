/**
 * Image utilities: compression, thumbnail generation, face blur
 */

export async function compressImage(file: File | Blob, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob || new Blob()),
        'image/jpeg',
        quality
      );
    };

    img.src = url;
  });
}

export async function generateThumbnail(file: File | Blob, size = 200): Promise<Blob> {
  return compressImage(file, size, 0.5);
}

export async function applyFaceBlur(imageBlob: Blob, regions: { x: number; y: number; width: number; height: number }[]): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Apply pixelation blur to each region
      for (const region of regions) {
        const pixelSize = 15;
        const x = Math.floor(region.x * img.width);
        const y = Math.floor(region.y * img.height);
        const w = Math.floor(region.width * img.width);
        const h = Math.floor(region.height * img.height);

        const imageData = ctx.getImageData(x, y, w, h);
        const data = imageData.data;

        for (let py = 0; py < h; py += pixelSize) {
          for (let px = 0; px < w; px += pixelSize) {
            const idx = (py * w + px) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
              for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
                const i = ((py + dy) * w + (px + dx)) * 4;
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
              }
            }
          }
        }

        ctx.putImageData(imageData, x, y);
      }

      canvas.toBlob((blob) => resolve(blob || new Blob()), 'image/jpeg', 0.9);
    };

    img.src = url;
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export const IMAGE_CATEGORIES = [
  { value: 'identification', label: 'Patient Photo', icon: '👤' },
  { value: 'edema', label: 'Edema', icon: '🦶' },
  { value: 'rash', label: 'Rash / Skin Changes', icon: '🔴' },
  { value: 'jaundice', label: 'Jaundice', icon: '🟡' },
  { value: 'pallor', label: 'Pallor (Anemia)', icon: '⚪' },
  { value: 'lab-result', label: 'Lab Result', icon: '🧪' },
  { value: 'referral-doc', label: 'Referral Document', icon: '📋' },
  { value: 'citizenship', label: 'Citizenship Card', icon: '🪪' },
  { value: 'other', label: 'Other', icon: '📷' },
] as const;
