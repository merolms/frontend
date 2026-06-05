// Attachment API Service
// Handles file uploads and downloads for course attachments
// Backend: POST /attachments (multipart), GET /attachments/download?file=<uuid>

import { apiGet, apiUpload } from "@/app/services/http";

// ==================== UPLOAD ====================
// POST /attachments
// Body: FormData with `file` field
// Returns: { id, title, name, size, type, courseId, url }
export const uploadAttachment = async (file, courseId, title = "") => {
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
export const getDownloadUrl = (fileUuid) => {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";
  return `${API_BASE}/attachments/download?file=${encodeURIComponent(fileUuid)}`;
};

// ==================== LIST BY COURSE ====================
// GET /courses/:courseId/attachments (via course detail)
// Attachments are returned as part of course detail response
export const fetchAttachmentsByCourse = async (courseId) => {
  try {
    const course = await apiGet(`/courses/${courseId}`);
    return course.attachments || [];
  } catch (error) {
    console.error("Error fetching attachments:", error);
    throw error;
  }
};
