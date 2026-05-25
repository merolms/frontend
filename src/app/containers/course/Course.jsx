import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Button, Input,
  Dropdown, Pagination, Label, Divider, Image, Table,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import {
  mockFetchCourses, mockCategories,
} from '@/app/services/courseService';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import './Course.scss';

// ─── Constants ────────────────────────────────────────────────

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

const viewModes = [
  { key: 'grid', icon: 'grid layout', label: 'Grid' },
  { key: 'table', icon: 'table', label: 'Table' },
  { key: 'list', icon: 'list layout', label: 'List' },
  { key: 'compact', icon: 'content', label: 'Compact' },
];

// ─── Helpers ──────────────────────────────────────────────────

const getStatusLabel = (status) => {
  switch (status) {
    case 'published': return <Label color='green' size='tiny'>Published</Label>;
    case 'draft': return <Label color='grey' size='tiny'>Draft</Label>;
    case 'archived': return <Label color='orange' size='tiny'>Archived</Label>;
    default: return null;
  }
};

const getCategoryColor = (category) => {
  const colors = {
    Programming: 'blue',
    Design: 'pink',
    'Data Science': 'violet',
    DevOps: 'orange',
    Business: 'teal',
  };
  return colors[category] || 'grey';
};

// ─── View Components ──────────────────────────────────────────

const GridView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='courses-view-grid'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='course-card-skeleton'>
            <div className='skeleton-image' />
            <div className='skeleton-content'>
              <div className='skeleton-title' />
              <div className='skeleton-text' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='courses-view-grid'>
      {courses.map((course) => (
        <div
          key={course.id}
          className='course-card-item'
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          {course.coverImage ? (
            <Image src={course.coverImage} wrapped ui={false} className='course-card-image' />
          ) : (
            <div className='course-card-image-placeholder'>
              <Icon name='book' size='huge' color='grey' />
            </div>
          )}
          <div className='course-card-body'>
            <div className='course-card-header-row'>
              <h3 className='course-card-title'>{course.title}</h3>
              {getStatusLabel(course.status)}
            </div>
            <p className='course-card-description'>{course.description}</p>
            <div className='course-card-meta'>
              <span className='course-card-author'>
                <Icon name='user' size='mini' /> {course.author}
              </span>
              <span className='course-card-meta-sep'>·</span>
              <Label size='mini' color={getCategoryColor(course.category)}>{course.category}</Label>
            </div>
            <div className='course-card-footer'>
              <div className='course-stats'>
                <span><Icon name='list' size='mini' /> {course.totalLessons} lessons</span>
                <span><Icon name='users' size='mini' /> {course.enrolledUsers}</span>
                <span><Icon name='clock outline' size='mini' /> {course.duration}</span>
              </div>
              <PermissionGuard permissions={['courses.edit']}>
                <div className='course-card-actions' onClick={(e) => e.stopPropagation()}>
                  <Button size='small' icon as={Link} to={`/courses/${course.id}/edit`} title='Edit'>
                    <Icon name='pencil' />
                  </Button>
                </div>
              </PermissionGuard>
            </div>
            {course.tags?.length > 0 && (
              <div className='course-tags'>
                {course.tags.slice(0, 4).map((tag) => (
                  <Label key={tag} size='mini' style={{ marginRight: 4, marginBottom: 4 }}>{tag}</Label>
                ))}
                {course.tags.length > 4 && (
                  <Label size='mini' style={{ marginRight: 4 }}>+{course.tags.length - 4}</Label>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const TableView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <Table celled className='courses-view-table'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={5}>Course</Table.HeaderCell>
            <Table.HeaderCell width={2}>Category</Table.HeaderCell>
            <Table.HeaderCell width={2}>Status</Table.HeaderCell>
            <Table.HeaderCell width={2}>Lessons</Table.HeaderCell>
            <Table.HeaderCell width={2}>Enrolled</Table.HeaderCell>
            <Table.HeaderCell width={3}>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[...Array(4)].map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell><div className='skeleton-table-cell' /></Table.Cell>
              <Table.Cell><div className='skeleton-table-cell short' /></Table.Cell>
              <Table.Cell><div className='skeleton-table-cell short' /></Table.Cell>
              <Table.Cell><div className='skeleton-table-cell short' /></Table.Cell>
              <Table.Cell><div className='skeleton-table-cell short' /></Table.Cell>
              <Table.Cell><div className='skeleton-table-cell short' /></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }

  return (
    <Table celled className='courses-view-table'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={5}>Course</Table.HeaderCell>
          <Table.HeaderCell width={2}>Category</Table.HeaderCell>
          <Table.HeaderCell width={2}>Status</Table.HeaderCell>
          <Table.HeaderCell width={2}>Lessons</Table.HeaderCell>
          <Table.HeaderCell width={2}>Enrolled</Table.HeaderCell>
          <Table.HeaderCell width={3} textAlign='center'>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {courses.map((course) => (
          <Table.Row key={course.id} className='course-table-row'>
            <Table.Cell>
              <div className='course-table-cell-main' onClick={() => navigate(`/courses/${course.id}`)}>
                {course.coverImage && (
                  <Image src={course.coverImage} size='tiny' className='course-table-thumb' />
                )}
                <div className='course-table-info'>
                  <div className='course-table-title'>{course.title}</div>
                  <div className='course-table-desc'>{course.description}</div>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Label size='tiny' color={getCategoryColor(course.category)}>{course.category}</Label>
            </Table.Cell>
            <Table.Cell>{getStatusLabel(course.status)}</Table.Cell>
            <Table.Cell textAlign='center'>{course.totalLessons}</Table.Cell>
            <Table.Cell textAlign='center'>{course.enrolledUsers}</Table.Cell>
            <Table.Cell textAlign='center'>
              <Button size='small' icon as={Link} to={`/courses/${course.id}`} title='View'>
                <Icon name='eye' />
              </Button>
              <PermissionGuard permissions={['courses.edit']}>
                <Button size='small' icon as={Link} to={`/courses/${course.id}/edit`} title='Edit'>
                  <Icon name='pencil' />
                </Button>
                <Button size='small' icon as={Link} to={`/courses/${course.id}/builder`} title='Builder'>
                  <Icon name='sitemap' />
                </Button>
              </PermissionGuard>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const ListView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='courses-view-list'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='course-list-skeleton'>
            <div className='skeleton-list-image' />
            <div className='skeleton-list-body'>
              <div className='skeleton-list-title' />
              <div className='skeleton-list-text' />
              <div className='skeleton-list-text short' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='courses-view-list'>
      {courses.map((course) => (
        <div
          key={course.id}
          className='course-list-item'
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          <Image
            src={course.coverImage || ''}
            className='course-list-image'
            wrapped={false}
            ui={!!course.coverImage}
          />
          {!course.coverImage && (
            <div className='course-list-image-placeholder'>
              <Icon name='book' size='large' color='grey' />
            </div>
          )}
          <div className='course-list-body'>
            <div className='course-list-top'>
              <h3 className='course-list-title'>{course.title}</h3>
              {getStatusLabel(course.status)}
            </div>
            <p className='course-list-description'>{course.description}</p>
            <div className='course-list-meta'>
              <span><Label size='tiny' color={getCategoryColor(course.category)}>{course.category}</Label></span>
              <span><Icon name='user' size='mini' /> {course.author}</span>
              <span><Icon name='list' size='mini' /> {course.totalLessons} lessons</span>
              <span><Icon name='users' size='mini' /> {course.enrolledUsers} enrolled</span>
              <span><Icon name='clock outline' size='mini' /> {course.duration}</span>
            </div>
          </div>
          <div className='course-list-actions' onClick={(e) => e.stopPropagation()}>
            <PermissionGuard permissions={['courses.edit']}>
              <Button icon as={Link} to={`/courses/${course.id}/builder`} title='Open Builder'>
                <Icon name='sitemap' />
              </Button>
              <Button icon as={Link} to={`/courses/${course.id}/edit`} title='Edit'>
                <Icon name='pencil' />
              </Button>
            </PermissionGuard>
            <Button icon as={Link} to={`/courses/${course.id}`} title='View'>
              <Icon name='arrow right' />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const CompactView = ({ courses, navigate, loading }) => {
  if (loading) {
    return (
      <div className='courses-view-compact'>
        {[...Array(6)].map((_, i) => (
          <div key={i} className='course-compact-skeleton'>
            <div className='skeleton-compact-icon' />
            <div className='skeleton-compact-body'>
              <div className='skeleton-compact-title' />
              <div className='skeleton-compact-text' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='courses-view-compact'>
      <div className='course-compact-header'>
        <span style={{ flex: 2 }}>Course</span>
        <span style={{ flex: 1 }}>Category</span>
        <span style={{ width: 100 }}>Status</span>
        <span style={{ width: 80 }} textAlign='center'>Lessons</span>
        <span style={{ width: 80 }} textAlign='center'>Enrolled</span>
        <span style={{ width: 80 }} textAlign='center'>Actions</span>
      </div>
      {courses.map((course) => (
        <div
          key={course.id}
          className='course-compact-row'
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          <div className='course-compact-title' style={{ flex: 2 }}>
            <Icon name='book' size='mini' style={{ marginRight: 6, opacity: 0.5 }} />
            {course.title}
          </div>
          <div style={{ flex: 1 }}>
            <Label size='tiny' color={getCategoryColor(course.category)}>{course.category}</Label>
          </div>
          <div style={{ width: 100 }}>{getStatusLabel(course.status)}</div>
          <div style={{ width: 80, textAlign: 'center' }}>{course.totalLessons}</div>
          <div style={{ width: 80, textAlign: 'center' }}>{course.enrolledUsers}</div>
          <div className='course-compact-actions' style={{ width: 80, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <Button size='mini' icon as={Link} to={`/courses/${course.id}/edit`} title='Edit'>
              <Icon name='pencil' />
            </Button>
            <Button size='mini' icon as={Link} to={`/courses/${course.id}/builder`} title='Builder'>
              <Icon name='sitemap' />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────

const CourseContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters from URL
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
      if (!value && value !== 0) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
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

  const handleViewModeChange = (mode) => {
    updateParams({ view: mode, page: 1 });
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

              {/* View Mode Switcher */}
              <div className='course-view-switcher'>
                {viewModes.map((mode) => (
                  <Button
                    key={mode.key}
                    icon
                    size='small'
                    toggle
                    active={viewMode === mode.key}
                    onClick={() => handleViewModeChange(mode.key)}
                    title={mode.label}
                  >
                    <Icon name={mode.icon} />
                  </Button>
                ))}
              </div>
            </div>

            {/* Active filter tags */}
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
          <div className='courses-view-container'>
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

                {/* Pagination */}
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
    </div>
  );
};

export default CourseContainer;
