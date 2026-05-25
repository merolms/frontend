// Category Service
// Manages course categories with full CRUD. Replace API calls with real backend later.

let nextCatId = 10;
const uid = `cat_${++nextCatId}`;

const colorOptions = [
  '#1976d2', '#e91e63', '#4caf50', '#ff9800', '#9c27b0',
  '#00bcd4', '#ff5722', '#795548', '#607d88', '#009688',
];

let mockCategories = [
  {
    id: 'cat_1', name: 'Programming', slug: 'programming',
    description: 'Software development, coding, and programming languages.',
    color: '#1976d2', icon: 'code',
    courseCount: 8, status: 'active', createdAt: '2024-01-10', updatedAt: '2025-03-01',
  },
  {
    id: 'cat_2', name: 'Design', slug: 'design',
    description: 'UI/UX design, graphic design, and visual communication.',
    color: '#e91e63', icon: 'paint brush',
    courseCount: 5, status: 'active', createdAt: '2024-01-15', updatedAt: '2025-02-20',
  },
  {
    id: 'cat_3', name: 'Data Science', slug: 'data-science',
    description: 'Data analysis, machine learning, and AI.',
    color: '#4caf50', icon: 'database',
    courseCount: 6, status: 'active', createdAt: '2024-02-01', updatedAt: '2025-03-10',
  },
  {
    id: 'cat_4', name: 'DevOps', slug: 'devops',
    description: 'Cloud infrastructure, CI/CD, and deployment.',
    color: '#ff9800', icon: 'server',
    courseCount: 3, status: 'active', createdAt: '2024-03-01', updatedAt: '2025-01-15',
  },
  {
    id: 'cat_5', name: 'Business', slug: 'business',
    description: 'Business strategy, management, and entrepreneurship.',
    color: '#9c27b0', icon: 'briefcase',
    courseCount: 4, status: 'active', createdAt: '2024-03-15', updatedAt: '2025-02-01',
  },
  {
    id: 'cat_6', name: 'Marketing', slug: 'marketing',
    description: 'Digital marketing, SEO, and content strategy.',
    color: '#00bcd4', icon: 'bullhorn',
    courseCount: 2, status: 'inactive', createdAt: '2024-04-01', updatedAt: '2024-12-01',
  },
  {
    id: 'cat_7', name: 'Photography', slug: 'photography',
    description: 'Photo editing, camera techniques, and visual arts.',
    color: '#ff5722', icon: 'camera',
    courseCount: 0, status: 'active', createdAt: '2024-05-01', updatedAt: '2024-05-01',
  },
];

// ==================== FETCH ====================

export const fetchCategories = async (params = {}) => {
  await new Promise((r) => setTimeout(r, 200));
  let results = [...mockCategories];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    results = results.filter((c) => c.status === params.status);
  }

  if (params.sort === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (params.sort === 'courses') {
    results.sort((a, b) => b.courseCount - a.courseCount);
  } else if (params.sort === 'recent') {
    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  return Promise.resolve(results);
};

export const fetchCategoryById = async (id) => {
  await new Promise((r) => setTimeout(r, 200));
  const cat = mockCategories.find((c) => c.id === id);
  if (!cat) return Promise.reject(new Error('Category not found'));
  return Promise.resolve({ ...cat });
};

// ==================== CRUD ====================

export const createCategory = async (data) => {
  await new Promise((r) => setTimeout(r, 300));
  const existing = mockCategories.find(
    (c) => c.name.toLowerCase() === data.name.toLowerCase()
  );
  if (existing) return Promise.reject(new Error('A category with this name already exists.'));

  const newCat = {
    id: uid(),
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
    description: data.description || '',
    color: data.color || colorOptions[Math.floor(Math.random() * colorOptions.length)],
    icon: data.icon || 'folder',
    courseCount: 0,
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  mockCategories.push(newCat);
  return Promise.resolve(newCat);
};

export const updateCategory = async (id, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const index = mockCategories.findIndex((c) => c.id === id);
  if (index === -1) return Promise.reject(new Error('Category not found'));

  const duplicate = mockCategories.find(
    (c) => c.id !== id && c.name.toLowerCase() === (data.name || '').toLowerCase()
  );
  if (duplicate) return Promise.reject(new Error('A category with this name already exists.'));

  mockCategories[index] = {
    ...mockCategories[index],
    ...data,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  return Promise.resolve(mockCategories[index]);
};

export const deleteCategory = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  const cat = mockCategories.find((c) => c.id === id);
  if (!cat) return Promise.reject(new Error('Category not found'));
  if (cat.courseCount > 0) {
    return Promise.reject(new Error(`Cannot delete "${cat.name}" — ${cat.courseCount} course(s) use this category.`));
  }
  mockCategories = mockCategories.filter((c) => c.id !== id);
  return Promise.resolve();
};

export const toggleCategoryStatus = async (id) => {
  await new Promise((r) => setTimeout(r, 200));
  const cat = mockCategories.find((c) => c.id === id);
  if (!cat) return Promise.reject(new Error('Category not found'));
  cat.status = cat.status === 'active' ? 'inactive' : 'active';
  cat.updatedAt = new Date().toISOString().split('T')[0];
  return Promise.resolve(cat);
};

export const getCategoryColorOptions = () => colorOptions;

export const getCategoryIconOptions = [
  'code', 'paint brush', 'database', 'server', 'briefcase', 'bullhorn',
  'camera', 'music', 'book', 'globe', 'star', 'heart',
  'lightbulb', 'rocket', 'wrench', 'chart line', 'folder',
];
