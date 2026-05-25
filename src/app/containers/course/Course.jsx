import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Segment, Icon, Button, Input,
  Dropdown, Pagination, Label, Divider, Header,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { mockFetchCourses, mockCategories } from '@/app/services/courseService';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import ViewModeSwitcher from './views/ViewModeSwitcher';
import GridView from './views/GridView';
import TableView from './views/TableView';
import ListView from './views/ListView';
import CompactView from './views/CompactView';
import './Course.scss';

const statusOptions = [
  { key: 'all', text: 'All', value: '' },
  { key: 'published', text: 'Published', value: 'published' },
  { key: 'draft', text: 'Draft', value: 'draft' },
  { key: 'archived', text: 'Archived', value: 'archived' },
];

const categoryOptions = [
  { key: 'all', text: 'All Categories', value: '' },
  ...mockCategories.map((cat) => ({ key: cat, text: cat, value: cat })),
];

const sortOptions = [
  { key: 'date', text: 'Newest First', value: 'date' },
  { key: 'title', text: 'Title A-Z', value: 'title' },
  { key: 'enrolled', text: 'Most Enrolled', value: 'enrolled' },
];

const CourseContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'date';
  const viewMode = searchParams.get('view') || 'grid';

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const limit = viewMode === 'list' ? 10 : viewMode === 'compact' ? 15 : 8;
      const data = await mockFetchCourses({ search, status, category, sort, page, limit });
      setCourses(data.courses);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, sort, page, viewMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value && value !== 0) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page && !updates.view) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  };

  const handlePageChange = (e, { activePage }) => {
    updateParams({ page: activePage });
  };

  const renderView = () => {
    const props = { courses, navigate, loading };
    switch (viewMode) {
      case 'table': return <TableView {...props} />;
      case 'list': return <ListView {...props} />;
      case 'compact': return <CompactView {...props} />;
      default: return <GridView {...props} />;
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />

      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Header */}
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Courses</h1>
            <p className='page-subtitle'>{total} course{total !== 1 ? 's' : ''} total</p>
          </div>
          <div className='header-right'>
            <PermissionGuard permissions={['courses.create']}>
              <Button icon primary onClick={() => navigate('/courses/create')}>
                <Icon name='plus' /> New Course
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className='dashboard-content'>
          {/* Filters Bar */}
          <Segment className='course-filters' secondary>
            <div className='course-filters-row'>
              <div className='course-filters-left'>
                <form className='course-search-form' onSubmit={handleSearch}>
                  <Input
                    icon='search'
                    placeholder='Search courses...'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </form>
                <Dropdown
                  placeholder='Status'
                  selection
                  options={statusOptions}
                  value={status}
                  onChange={(e, { value }) => updateParams({ status: value, page: 1 })}
                  className='course-filter-dropdown'
                />
                <Dropdown
                  placeholder='Category'
                  selection
                  options={categoryOptions}
                  value={category}
                  onChange={(e, { value }) => updateParams({ category: value, page: 1 })}
                  className='course-filter-dropdown'
                />
                <Dropdown
                  placeholder='Sort'
                  selection
                  options={sortOptions}
                  value={sort}
                  onChange={(e, { value }) => updateParams({ sort: value, page: 1 })}
                  className='course-filter-dropdown'
                />
                <Button
                  basic
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear
                </Button>
              </div>
              <ViewModeSwitcher value={viewMode} onChange={(mode) => updateParams({ view: mode, page: 1 })} />
            </div>

            {(status || category || search) && (
              <div className='active-filters'>
                <span style={{ fontSize: '12px', color: '#888', marginRight: '8px' }}>Filters:</span>
                {search && (
                  <Label size='small' color='blue' onRemove={() => { setSearchInput(''); updateParams({ search: '', page: 1 }); }}>
                    Search: {search}
                  </Label>
                )}
                {status && (
                  <Label size='small' color='green' onRemove={() => updateParams({ status: '', page: 1 })}>
                    {status}
                  </Label>
                )}
                {category && (
                  <Label size='small' color='teal' onRemove={() => updateParams({ category: '', page: 1 })}>
                    {category}
                  </Label>
                )}
              </div>
            )}
          </Segment>

          {/* Course Views */}
          {courses.length === 0 && !loading ? (
            <Segment placeholder className='courses-empty'>
              <Header icon>
                <Icon name='search' />
                No courses found
              </Header>
              <p>Try adjusting your filters or create a new course.</p>
              <PermissionGuard permissions={['courses.create']}>
                <Button primary onClick={() => navigate('/courses/create')}>
                  <Icon name='plus' /> Create Course
                </Button>
              </PermissionGuard>
            </Segment>
          ) : (
            <>
              {renderView()}
              {totalPages > 1 && (
                <div className='courses-pagination'>
                  <Pagination
                    activePage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContainer;
