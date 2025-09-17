// src/components/Customer/PhotosPanel.jsx
import React from 'react';
import usePhotoBlobs from '@/hooks/usePhotoBlobs';

export default function PhotosPanel({
  loading,
  photos,
  onOpenUpload,
  onDeletePhoto,
  formatDateTimeVN,
}) {
  const blobs = usePhotoBlobs(photos);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
        <p className="mt-3 text-gray-600">Đang tải ảnh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Ảnh điều trị</h2>
        <button
          type="button"
          onClick={onOpenUpload}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-pink-700"
        >
          + Upload ảnh
        </button>
      </div>

      {/* Grid ảnh */}
      {photos?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.photoId}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <img
                src={blobs[p.photoId] || ''}
                alt={p.fileName || 'Ảnh'}
                className="h-40 w-full object-cover transition group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDeletePhoto(p.photoId)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Xoá
                  </button>
                </div>
                <div className="text-xs text-white">
                  <div>
                    <span className="font-medium">{p.type}</span>{' '}
                    {p.takenAt ? formatDateTimeVN(p.takenAt) : ''}
                  </div>
                  {p.note && <div className="truncate">{p.note}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          Chưa có ảnh nào
        </div>
      )}
    </div>
  );
}
