// Category API Service
// Handles all API calls related to categories
// Backend response envelope: { message: "success", data: ... }

import { apiGet, apiPost, apiPut, apiDelete } from '@/app/services/http';

import { t } from '@/styles/theme';

// ==================== CATEGORIES ====================
// GET /categories?start=0&limit=10  → returns Summaries { total, data: Category[] }
// GET /categories/{id}             → returns Response { data: Category }
// POST /categories                 → body: Category, returns Response { data: Category }
// PUT /categories/{id}             → body: Category, returns Response { data: Category }
// DELETE /categories/{id}          → returns Response { data: "Category deleted successfully" }

export const fetchCategories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set('start', params.start);
    if (params.limit !== undefined) queryParams.set('limit', params.limit);
    const data = await apiGet(`/categories?${queryParams}`);
    // Backend returns Summaries { total, data: [...] } for list
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    // Fallback for direct array response
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoriesWithPagination = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start !== undefined) queryParams.set('start', params.start);
    if (params.limit !== undefined) queryParams.set('limit', params.limit);
    const token = localStorage.getItem('auth_token');
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:9090';
    const url = `/categories?${queryParams}`;
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch categories: ' + res.status);
    const body = await res.json();
    const envelope = body.data || body;
    const list = Array.isArray(envelope.data)
      ? envelope.data
      : Array.isArray(envelope)
        ? envelope
        : [];
    const total = envelope.total !== undefined ? envelope.total : list.length;
    return { categories: list, total };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  try {
    return await apiGet(`/categories/${id}`);
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const body = {
      name: categoryData.name || '',
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: categoryData.description || '',
      color: categoryData.color || t('accent'),
      icon: categoryData.icon || 'folder',
      status: 1,
    };
    return await apiPost('/categories', body);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const body = {
      name: categoryData.name || '',
      slug: categoryData.slug || '',
      description: categoryData.description || '',
      color: categoryData.color || t('accent'),
      icon: categoryData.icon || 'folder',
      status: categoryData.status !== undefined ? categoryData.status : 1,
    };
    return await apiPut(`/categories/${id}`, body);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    await apiDelete(`/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const toggleCategoryStatus = async (id) => {
  try {
    // Fetch current category, toggle status, update
    const cat = await fetchCategoryById(id);
    const newStatus = cat.status === 1 ? 0 : 1;
    return await updateCategory(id, { ...cat, status: newStatus });
  } catch (error) {
    console.error('Error toggling category status:', error);
    throw error;
  }
};

export const getCategoryColorOptions = () => [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#EF4444', label: 'Red' },
  { value: '#3B82F6', label: 'Blue' },
];
export const getCategoryIconOptions = [
  'code', 'paint brush', 'database', 'server', 'briefcase', 'bullhorn',
  'camera', 'music', 'book', 'globe', 'star', 'heart',
  'lightbulb', 'rocket', 'wrench', 'chart line', 'folder',
];
