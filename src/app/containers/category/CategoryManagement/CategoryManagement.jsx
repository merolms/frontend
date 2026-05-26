import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Table, Label, Pagination,
  Dropdown, Divider, Header, Grid,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import {
  fetchCategoriesWithPagination, deleteCategory, toggleCategoryStatus,
  createCategory, updateCategory,
} from '@/app/services/categoryService';
import CategoryForm from '../components/CategoryForm';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { useToast } from '@/app/context/ToastContext';
import './Category.scss';

export { fetchCategoriesWithPagination, deleteCategory, toggleCategoryStatus };

const statusOptions = [
  { key: '', text: 'All Status', value: '' },
  { key: 'active', text: 'Active', value: '1' },
  { key: 'inactive', text: 'Inactive', value: '0' },
];

const sortOptions = [
  { key: '', text: 'Default', value: '' },
  { key: 'name', text: 'Name A-Z', value: 'name' },
  { key: 'recent', text: 'Recently Updated', value: 'recent' },
];

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const start = (page - 1) * limit;
      let { categories: data, total: totalCount } = await fetchCategoriesWithPagination({
        start,
        limit,
      });

      // Client-side filtering
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
        );
      }
      if (statusFilter) {
        data = data.filter((c) => String(c.status) === statusFilter);
      }
      // Client-side sorting
      if (sort === 'name') {
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (sort === 'recent') {
        data.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      }

      setCategories(data);
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / limit) || 1);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCreate = () => {
    setEditingCat(null);
    setFormOpen(true);
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formData);
        addToast(`Category "${formData.name}" updated successfully`, 'success');
      } else {
        await createCategory(formData);
        addToast(`Category "${formData.name}" created successfully`, 'success');
      }
      setFormOpen(false);
      setEditingCat(null);
      await fetchData();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`Category "${deleteTarget.name}" deleted`, 'error');
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await toggleCategoryStatus(cat.id);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Categories</h1>
            <p className='page-subtitle'>{total} categor{total === 1 ? 'y' : 'ies'} total</p>
          </div>
          <div className='header-right'>
            <PermissionGuard permissions={['courses.create']}>
              <Button primary icon onClick={handleCreate}>
                <Icon name='plus' /> New Category
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className='dashboard-content'>
          {error && (
            <Segment negative>
              <Icon name='warning circle' /> {error}
            </Segment>
          )}

          {/* Filters */}
          <Segment className='category-filters' secondary>
            <div className='category-filters-row'>
              <form className='category-search-form' onSubmit={handleSearch}>
                <Input
                  icon='search'
                  placeholder='Search categories...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </form>
              <Dropdown placeholder='Status' selection options={statusOptions} value={statusFilter} onChange={(e, { value }) => { setStatusFilter(value); setPage(1); }} className='category-filter-dropdown' />
              <Dropdown placeholder='Sort' selection options={sortOptions} value={sort} onChange={(e, { value }) => { setSort(value); setPage(1); }} className='category-filter-dropdown' />
              <Button basic onClick={() => { setSearchInput(''); setSearch(''); setStatusFilter(''); setSort(''); setPage(1); }}>Clear</Button>
            </div>
          </Segment>

          {/* Table */}
          <Segment className='category-table-segment' style={{ padding: 0 }}>
            {loading ? (
              <Table celled compact>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={3}>Category</Table.HeaderCell>
                    <Table.HeaderCell width={5}>Description</Table.HeaderCell>
                    <Table.HeaderCell width={2} textAlign='center'>Courses</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Status</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Updated</Table.HeaderCell>
                    <Table.HeaderCell width={2} textAlign='center'>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {[...Array(5)].map((_, i) => (
                    <Table.Row key={i}>
                      {[3, 5, 2, 2, 2, 2].map((w, j) => (
                        <Table.Cell key={j}><div className='skeleton-line' /></Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : categories.length === 0 ? (
              <div className='category-empty'>
                <Icon name='folder' size='huge' color='grey' />
                <Header as='h3' color='grey'>No categories found</Header>
                <p>Try adjusting your filters or create a new category.</p>
                <PermissionGuard permissions={['courses.create']}>
                  <Button primary onClick={handleCreate}>
                    <Icon name='plus' /> Create First Category
                  </Button>
                </PermissionGuard>
              </div>
            ) : (
              <Table celled compact className='category-table'>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={3}>Category</Table.HeaderCell>
                    <Table.HeaderCell width={5}>Description</Table.HeaderCell>
                    <Table.HeaderCell width={2} textAlign='center'>Courses</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Status</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Updated</Table.HeaderCell>
                    <Table.HeaderCell width={2} textAlign='center'>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {categories.map((cat) => (
                    <Table.Row key={cat.id} className={cat.status === 0 ? 'status-inactive' : ''}>
                      <Table.Cell>
                        <div className='category-cell-main'>
                          <span className='category-dot' style={{ background: cat.color || '#1976d2' }} />
                          <div>
                            <div className='category-name'>{cat.name}</div>
                            {cat.slug && <div className='category-slug'>{cat.slug}</div>}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className='category-cell-desc'>{cat.description || '—'}</Table.Cell>
                      <Table.Cell textAlign='center'>
                        <Label color={(cat.courseCount || 0) > 0 ? 'blue' : 'grey'} size='tiny'>
                          {cat.courseCount || 0}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>
                        <Label color={cat.status === 1 ? 'green' : 'grey'} size='tiny' basic>
                          {cat.status === 1 ? 'Active' : 'Inactive'}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>
                        <span style={{ fontSize: '12px', color: '#888' }}>
                          {cat.updatedAt ? new Date(cat.updatedAt * 1000).toLocaleDateString() : '—'}
                        </span>
                      </Table.Cell>
                      <Table.Cell textAlign='center'>
                        <PermissionGuard permissions={['courses.edit']}>
                          <Button size='small' icon onClick={() => handleEdit(cat)} title='Edit'>
                            <Icon name='pencil' />
                          </Button>
                        </PermissionGuard>
                        <Button size='small' icon onClick={() => handleToggleStatus(cat)} title={cat.status === 1 ? 'Deactivate' : 'Activate'}>
                          <Icon name={cat.status === 1 ? 'pause' : 'check'} />
                        </Button>
                        <PermissionGuard permissions={['courses.delete']}>
                          <Button size='small' icon color='red' onClick={() => setDeleteTarget(cat)} title='Delete'>
                            <Icon name='trash' />
                          </Button>
                        </PermissionGuard>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Segment>

          {totalPages > 1 && (
            <div className='category-pagination'>
              <Pagination activePage={page} totalPages={totalPages} onPageChange={(e, { activePage }) => setPage(activePage)} />
            </div>
          )}

          {/* Form Modal */}
          {formOpen && (
            <CategoryForm
              category={editingCat}
              onSubmit={handleFormSubmit}
              onClose={() => { setFormOpen(false); setEditingCat(null); }}
              loading={actionLoading}
            />
          )}

          {/* Delete Modal */}
          <DeleteModal
            open={!!deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            itemName={deleteTarget?.name}
            itemType='category'
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
