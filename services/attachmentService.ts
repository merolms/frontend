// @ts-nocheck
// Attachment API Service
// Handles file uploads and downloads for course attachments
// Backend: POST /attachments (multipart), GET /attachments/download?file=<uuid>

import { apiGet, apiUpload } from "@/services/http";

// ==================== UPLOAD ====================
// POST /attachments
// Body: FormData with `file` field
// Returns: { id, title, name, size, type, courseId, url }
export const uploadAttachment = async (
  file: File,
  courseId: string | number,
  title = ""
): Promise<unknown> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (courseId) formData.append("courseId", String(courseId));
    if (title) formData.append("title", title);
    return await apiUpload("/attachments", formData);
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
};

// ==================== DOWNLOAD ====================
// GET /attachments/download?file=<uuid>
// Returns the file download URL
export const getDownloadUrl = (fileUuid: string): string => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://192.168.1.67:9090";
  return `${API_BASE}/attachments/download?file=${encodeURIComponent(fileUuid)}`;
};

// ==================== LIST BY COURSE ====================
// GET /courses/:courseId/attachments (via course detail)
// Attachments are returned as part of course detail response
export const fetchAttachmentsByCourse = async (courseId: string | number): Promise<unknown[]> => {
  try {
    const course = await apiGet(`/courses/${courseId}`);
    return course.attachments || [];
  } catch (error) {
    console.error("Error fetching attachments:", error);
    throw error;
  }
};
