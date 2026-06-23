import { uploadBlockMedia } from "@/app/services/blockService";

/**
 * Shared editor media upload helper.
 *
 * Wraps blockService.uploadBlockMedia so editor blocks
 * can upload a file before storing its URL in document attrs.
 *
 * @param {File} file
 * @param {string} lessonId
 * @param {string} blockId - may be a temp_ id for autosave blocks
 * @returns {{ url: string, fileName: string }}
 */
export const uploadEditorMedia = async (file, lessonId, blockId) => {
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
