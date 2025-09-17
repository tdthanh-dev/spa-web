// src/hooks/usePhotoBlobs.js
import { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';

export default function usePhotoBlobs(photos) {
  const [urls, setUrls] = useState({}); // { [photoId]: objectUrl }

  useEffect(() => {
    let isMounted = true;
    const abort = new AbortController();
    const objectUrls = []; // để revoke

    async function load() {
      if (!photos?.length) { setUrls({}); return; }

      const entries = await Promise.all(photos.map(async (p) => {
        try {
          // p.fileUrl BE trả dạng "/api/photos/download/{customerId}/{file}"
          // apiClient.baseURL = "/api" hoặc "http://localhost:8081/api"
          // -> ta bỏ prefix "/api" nếu baseURL = "/api"
          const path = p.fileUrl?.startsWith('/api/')
            ? p.fileUrl.slice(5) // "photos/download/..."
            : p.fileUrl;

          const res = await apiClient.get(path, {
            responseType: 'blob',
            signal: abort.signal,
          });
          const objUrl = URL.createObjectURL(res.data);
          objectUrls.push(objUrl);
          return [p.photoId ?? p.id, objUrl];
        } catch (e) {
          console.error('Load photo blob failed:', e);
          return [p.photoId ?? p.id, null];
        }
      }));

      if (!isMounted) return;
      setUrls(Object.fromEntries(entries));
    }

    load();

    return () => {
      isMounted = false;
      abort.abort();
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [JSON.stringify(photos?.map(p => p.fileUrl))]); // thay đổi khi danh sách/URL thay đổi

  return urls;
}
