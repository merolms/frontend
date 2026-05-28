import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Paper, TextInput, Button, Select, Group, Box, Stack, Text, Pagination, SimpleGrid, Loader, Badge, Anchor } from '@mantine/core';
import { IconSearch, IconPlus, IconRefresh, IconAlertCircle, IconBook } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchCourses, mockCategories } from '@/app/services/courseService';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import ViewModeSwitcher from './views/ViewModeSwitcher';
import GridView from './views/GridView';
import TableView from './views/TableView';
import ListView from './views/ListView';
import CompactView from './views/CompactView';
import './Course.scss';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Published', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'Archived', label: 'Archived' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...mockCategories.map((cat) => ({ value: cat, label: cat })),
];

const sortOptions = [
  { value: '', label: 'Newest First' },
  { value: 'title', label: 'Title A-Z' },
];

const CourseContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const viewMode = searchParams.get('view') || 'grid';

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const limit = viewMode === 'list' ? 10 : viewMode === 'compact' ? 15 : 8;
      const data = await fetchCourses({ search, status, category, sort, page, limit });
      setCourses(data.courses);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, sort, page, viewMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refreshList = useCallback(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value && value !== 0) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page && !updates.view) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: searchInput, page: 1 }); };

  const handleClear = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const renderView = () => {
    const props = { courses, navigate, loading, onRefresh: refreshList };
    switch (viewMode) {
      case 'table': return <TableView {...props} />;
      case 'list': return <ListView {...props} />;
      case 'compact': return <CompactView {...props} />;
      default: return <GridView {...props} />;
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Courses</h1>
            <p className='page-subtitle'>{total} course{total !== 1 ? 's' : ''} total</p>
          </div>
          <div className='header-right'>
            <PermissionGuard permissions={['courses.create']}>
              <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/courses/create')}>New Course</Button>
            </PermissionGuard>
          </div>
        </div>

        <div className='dashboard-content'>
          <Paper className='course-filters' p="sm" radius="md" withBorder mb="md">
            <div className='course-filters-row' style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <form className='course-search-form' onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <TextInput
                  placeholder='Search courses...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  leftSection={<IconSearch size={16} />}
                  style={{ flex: 1 }}
                />
              </form>
              <Select placeholder='Status' data={statusOptions} value={status} onChange={(v) => updateParams({ status: v || '', page: 1 })} className='course-filter-dropdown' allowDeselect={false} />
              <Select placeholder='Category' data={categoryOptions} value={category} onChange={(v) => updateParams({ category: v || '', page: 1 })} className='course-filter-dropdown' allowDeselect={false} />
              <Select placeholder='Sort' data={sortOptions} value={sort} onChange={(v) => updateParams({ sort: v || '', page: 1 })} className='course-filter-dropdown' allowDeselect={false} />
              <Button variant="default" onClick={handleClear}>Clear</Button>
              <ViewModeSwitcher value={viewMode} onChange={(mode) => updateParams({ view: mode, page: 1 })} />
            </div>

            {(status || category || search) && (
              <div className='active-filters' style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Text size="xs" c="dimmed">Filters:</Text>
                {search && <Badge size="sm" variant="light" color="blue" onClose={() => { setSearchInput(''); updateParams({ search: '', page: 1 }); }}>Search: {search}</Badge>}
                {status && <Badge size="sm" variant="light" color="green" onClose={() => updateParams({ status: '', page: 1 })}>{status}</Badge>}
                {category && <Badge size="sm" variant="light" color="teal" onClose={() => updateParams({ category: '', page: 1 })}>{category}</Badge>}
              </div>
            )}
          </Paper>

          {error && !loading && (
            <Paper p="md" radius="md" withBorder className='courses-empty'>
              <Group><IconAlertCircle color="red" /><Text>{error}</Text><Button size="xs" leftSection={<IconRefresh size={14} />} onClick={fetchData}>Retry</Button></Group>
            </Paper>
          )}

          {!error && courses.length === 0 && !loading ? (
            <Paper p="xl" radius="md" withBorder className='courses-empty' ta="center" mt="md">
              <Text size="xl"><IconBook size={48} color="#999" /></Text>
              <Text mt="md">No courses found. Try adjusting your filters or create a new course.</Text>
              <PermissionGuard permissions={['courses.create']}>
                <Button mt="md" leftSection={<IconPlus size={16} />} onClick={() => navigate('/courses/create')}>Create Course</Button>
              </PermissionGuard>
            </Paper>
          ) : !error && (
            <>
              {renderView()}
              {totalPages > 1 && (
                <div className='courses-pagination' style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <Pagination total={totalPages} value={page} onChange={(p) => updateParams({ page: p })} />
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
