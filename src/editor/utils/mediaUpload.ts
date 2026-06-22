import { uploadBlockMedia } from "@/app/services/blockService";

/**
 * Shared editor media upload helper.
 *
 * Wraps blockService.uploadBlockMedia so editor blocks
 * can upload a file before storing its URL in document attrs.
 */
export interface UploadedMedia {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export const uploadEditorMedia = async (
  file: File,
  lessonId: string | number,
  blockId?: string | number
): Promise<UploadedMedia> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const url = await uploadBlockMedia(lessonId, blockId, file);

  if (!url) {
    throw new Error("Upload failed: no URL returned from server.");
  }

  return {
    url,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
};

export default uploadEditorMedia;
