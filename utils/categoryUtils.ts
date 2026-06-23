// Category utility functions
// Non-API related helper functions for category management

import { t } from "@/styles/theme";

export interface ColorOption {
  value: string;
  label: string;
}

export const getCategoryColorOptions = (): ColorOption[] => [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#10B981", label: "Emerald" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];

export const getCategoryIconOptions: string[] = [
  "code",
  "paint brush",
  "database",
  "server",
  "briefcase",
  "bullhorn",
  "camera",
  "music",
  "book",
  "globe",
  "star",
  "heart",
  "lightbulb",
  "rocket",
  "wrench",
  "chart line",
  "folder",
];

/**
 * Generate a slug from a category name
 * @param name - Category name
 * @returns Generated slug
 */
export const generateCategorySlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: number;
}

/**
 * Get default category values
 * @returns Default category object
 */
export const getDefaultCategoryValues = (): CategoryFormData => ({
  name: "",
  slug: "",
  description: "",
  color: t("accent"),
  icon: "folder",
  status: 1,
});

/**
 * Prepare category data for API submission
 * @param formData - Form data from CategoryForm
 * @returns API-ready category data
 */
export const prepareCategoryData = (formData: CategoryFormData): CategoryFormData => ({
  name: formData.name || "",
  slug: formData.slug || generateCategorySlug(formData.name),
  description: formData.description || "",
  color: formData.color || t("accent"),
  icon: formData.icon || "folder",
  status: formData.status !== undefined ? formData.status : 1,
});
