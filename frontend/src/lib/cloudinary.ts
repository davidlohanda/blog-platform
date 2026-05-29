'use client';

import { apiClient } from './api/client';

interface SignedUploadParams {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export async function uploadToCloudinary(
  file: File,
  folder = 'lentera/articles',
): Promise<string> {
  // 1. Get signed params from our backend
  const { data } = await apiClient.get<{ data: SignedUploadParams }>(
    `/media/upload-url?folder=${encodeURIComponent(folder)}`,
  );
  const { signature, timestamp, cloudName, apiKey, folder: uploadFolder } = data.data;

  // 2. Upload directly to Cloudinary (no API secret exposed to client)
  const form = new FormData();
  form.append('file', file);
  form.append('signature', signature);
  form.append('timestamp', String(timestamp));
  form.append('api_key', apiKey);
  form.append('folder', uploadFolder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? 'Upload ke Cloudinary gagal');
  }

  const result = await res.json() as { secure_url: string };
  return result.secure_url;
}
