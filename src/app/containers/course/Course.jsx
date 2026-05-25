import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Header, Segment, Grid, Card, Icon, Button, Input,
  Dropdown, Pagination, Label, Menu, Divider, Image,
} from 'semantic-ui-react';
import SideBar from '../SideBar/SideBar';
import {
  mockFetchCourses, mockCategories,
} from '../../services/courseService';
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

const getStatusLabel = (status) => {
  switch (status) {
    case 'published':
      return <Label color='green' size='tiny'>Published</Label>;
    case 'draft':
      return <Label color='grey' size='tiny'>Draft</Label>;
    case 'archived':
      return <Label color='orange' size='tiny'>Archived</Label>;
    default:
      return null;
  }
};

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

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockFetchCourses({
        search,
        status,
        category,
        sort,
        page,
        limit: 8,
      });
      setCourses(data.courses);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, sort, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    if (!updates.page) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  };

  const handlePageChange = (e, { activePage }) => {
    updateParams({ page: activePage });
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
            <Button icon primary onClick={() => navigate('/courses/create')}>
              <Icon name='plus' /> New Course
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          {/* Filters Bar */}
          <Segment className='course-filters' secondary>
            <Grid stackable>
              <Grid.Column width={5}>
                <form onSubmit={handleSearch}>
                  <Input
                    icon='search'
                    placeholder='Search courses...'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    fluid
                  />
                </form>
              </Grid.Column>
              <Grid.Column width={3}>
                <Dropdown
                  placeholder='Status'
                  selection
                  options={statusOptions}
                  value={status}
                  onChange={(e, { value }) => updateParams({ status: value, page: 1 })}
                  fluid
                />
              </Grid.Column>
              <Grid.Column width={3}>
                <Dropdown
                  placeholder='Category'
                  selection
                  options={categoryOptions}
                  value={category}
                  onChange={(e, { value }) => updateParams({ category: value, page: 1 })}
                  fluid
                />
              </Grid.Column>
              <Grid.Column width={3}>
                <Dropdown
                  placeholder='Sort'
                  selection
                  options={sortOptions}
                  value={sort}
                  onChange={(e, { value }) => updateParams({ sort: value, page: 1 })}
                  fluid
                />
              </Grid.Column>
              <Grid.Column width={2}>
                <Button
                  basic
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear
                </Button>
              </Grid.Column>
            </Grid>

            {/* Active filter tags */}
            {(status || category || search) && (
              <>
                <Divider hidden />
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
              </>
            )}
          </Segment>

          {/* Course Grid */}
          {loading ? (
            <Segment loading className='courses-grid-segment'>
              <Grid columns={4} stackable>
                {[...Array(4)].map((_, i) => (
                  <Grid.Column key={i}>
                    <Card>
                      <div style={{ height: 150, background: '#f0f0f0' }} />
                      <Card.Content>
                        <div style={{ height: 20, background: '#f0f0f0', marginBottom: 8 }} />
                        <div style={{ height: 14, background: '#f0f0f0' }} />
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                ))}
              </Grid>
            </Segment>
          ) : courses.length === 0 ? (
            <Segment className='courses-empty' placeholder>
              <Header icon>
                <Icon name='search' />
                No courses found
              </Header>
              <p>Try adjusting your filters or create a new course.</p>
              <Button primary onClick={() => navigate('/courses/create')}>
                <Icon name='plus' /> Create Course
              </Button>
            </Segment>
          ) : (
            <>
              <Grid columns={4} stackable className='courses-grid'>
                {courses.map((course) => (
                  <Grid.Column key={course.id}>
                    <Card
                      className='course-card-item'
                      onClick={() => navigate(`/courses/${course.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {course.coverImage ? (
                        <Image src={course.coverImage} wrapped ui={false} className='course-card-image' />
                      ) : (
                        <div className='course-card-image-placeholder'>
                          <Icon name='book' size='huge' color='grey' />
                        </div>
                      )}
                      <Card.Content>
                        <Card.Header>{course.title}</Card.Header>
                        <Card.Meta>
                          <span className='course-category'>{course.category}</span>
                        </Card.Meta>
                        <Card.Description>
                          <p className='course-description'>{course.description}</p>
                        </Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <div className='course-card-footer'>
                          <div className='course-stats'>
                            <span><Icon name='list' /> {course.totalLessons} lessons</span>
                            <span><Icon name='users' /> {course.enrolledUsers}</span>
                          </div>
                          {getStatusLabel(course.status)}
                        </div>
                        {course.tags && course.tags.length > 0 && (
                          <div className='course-tags' style={{ marginTop: 8 }}>
                            {course.tags.slice(0, 3).map((tag) => (
                              <Label key={tag} size='mini' style={{ marginRight: 4, marginBottom: 4 }}>
                                {tag}
                              </Label>
                            ))}
                            {course.tags.length > 3 && (
                              <Label size='mini' style={{ marginRight: 4 }}>+{course.tags.length - 3}</Label>
                            )}
                          </div>
                        )}
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='courses-pagination'>
                  <Pagination
                    activePage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    boundaryRange={1}
                    siblingRange={1}
                    ellipsisItem={null}
                    firstItem={null}
                    lastItem={null}
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
