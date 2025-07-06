export interface CapturedMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  blob: Blob;
  timestamp: number;
  filename: string;
  indexedDbId?: string; // ID used for IndexedDB storage
}

export type CameraMode = 'photo' | 'video';
export type CameraFacing = 'user' | 'environment';