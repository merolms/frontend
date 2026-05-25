import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Table, Label, Pagination,
  Dropdown, Divider, Header, Grid,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import {
  fetchCategories, deleteCategory, toggleCategoryStatus,
} from '@/app/services/categoryService';
import CategoryForm from '../components/CategoryForm';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import './Category.scss';

const statusOptions = [
  { key: '', text: 'All Status', value: '' },
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'inactive', text: 'Inactive', value: 'inactive' },
];

const sortOptions = [
  { key: '', text: 'Default', value: '' },
  { key: 'name', text: 'Name A-Z', value: 'name' },
  { key: 'courses', text: 'Most Courses', value: 'courses' },
  { key: 'recent', text: 'Recently Updated', value: 'recent' },
];

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories({ search, status, sort, page, limit });
      setCategories(data);
      setTotal(data.length);
      setTotalPages(Math.ceil(data.length / limit));
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

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
      } else {
        await createCategory(formData);
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
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
              <Dropdown placeholder='Status' selection options={statusOptions} value={status} onChange={(e, { value }) => { setStatus(value); setPage(1); }} className='category-filter-dropdown' />
              <Dropdown placeholder='Sort' selection options={sortOptions} value={sort} onChange={(e, { value }) => { setSort(value); setPage(1); }} className='category-filter-dropdown' />
              <Button basic onClick={() => { setSearchInput(''); setSearch(''); setStatus(''); setSort(''); setPage(1); }}>Clear</Button>
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
                    <Table.Row key={cat.id} className={`status-${cat.status}`}>
                      <Table.Cell>
                        <div className='category-cell-main'>
                          <span className='category-dot' style={{ background: cat.color }} />
                          <div>
                            <div className='category-name'>{cat.name}</div>
                            <div className='category-slug'>{cat.slug}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className='category-cell-desc'>{cat.description || '—'}</Table.Cell>
                      <Table.Cell textAlign='center'>
                        <Label color={cat.courseCount > 0 ? 'blue' : 'grey'} size='tiny'>
                          {cat.courseCount}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>
                        <Label color={cat.status === 'active' ? 'green' : 'grey'} size='tiny' basic>
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>{cat.updatedAt}</Table.Cell>
                      <Table.Cell textAlign='center'>
                        <PermissionGuard permissions={['courses.edit']}>
                          <Button size='small' icon onClick={() => handleEdit(cat)} title='Edit'>
                            <Icon name='pencil' />
                          </Button>
                        </PermissionGuard>
                        <Button size='small' icon onClick={() => handleToggleStatus(cat)} title={cat.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <Icon name={cat.status === 'active' ? 'pause' : 'check'} />
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
