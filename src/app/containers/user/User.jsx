import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Dropdown, Pagination,
  Label, Table, Image, Divider,
} from 'semantic-ui-react';
import SideBar from '../SideBar/SideBar';
import { DeleteModal } from '../course/CourseActions/CourseActions';
import { mockFetchUsers, mockDeleteUser, mockRoles } from '../../services/userService';
import './User.scss';

const roleOptions = [
  { key: 'all', text: 'All Roles', value: '' },
  ...mockRoles.map((r) => ({ key: r, text: r, value: r })),
];

const statusOptions = [
  { key: 'all', text: 'All Status', value: '' },
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'inactive', text: 'Inactive', value: 'inactive' },
];

const sortOptions = [
  { key: 'joined', text: 'Newest First', value: 'joined' },
  { key: 'name', text: 'Name A-Z', value: 'name' },
  { key: 'email', text: 'Email A-Z', value: 'email' },
  { key: 'lastActive', text: 'Last Active', value: 'lastActive' },
];

const getRoleColor = (role) => {
  switch (role) {
    case 'Administrator': return 'red';
    case 'Instructor': return 'blue';
    case 'Team Lead': return 'purple';
    case 'Student': return 'teal';
    default: return 'grey';
  }
};

const UserContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'joined';

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockFetchUsers({ search, role, status, sort, page, limit: 8 });
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) newParams.delete(key);
      else newParams.set(key, value);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await mockDeleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />

      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Users</h1>
            <p className='page-subtitle'>{total} user{total !== 1 ? 's' : ''} total</p>
          </div>
          <div className='header-right'>
            <Button icon primary onClick={() => navigate('/users/create')}>
              <Icon name='plus' /> Add User
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          {/* Filters */}
          <Segment className='user-filters' secondary>
            <div className='user-filters-row'>
              <form onSubmit={handleSearch} className='user-search-form'>
                <Input
                  icon='search'
                  placeholder='Search by name, email, or role...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fluid
                />
              </form>
              <Dropdown
                placeholder='Role'
                selection
                options={roleOptions}
                value={role}
                onChange={(e, { value }) => updateParams({ role: value, page: 1 })}
                className='user-filter-dropdown'
              />
              <Dropdown
                placeholder='Status'
                selection
                options={statusOptions}
                value={status}
                onChange={(e, { value }) => updateParams({ status: value, page: 1 })}
                className='user-filter-dropdown'
              />
              <Dropdown
                placeholder='Sort'
                selection
                options={sortOptions}
                value={sort}
                onChange={(e, { value }) => updateParams({ sort: value, page: 1 })}
                className='user-filter-dropdown'
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

            {(role || status || search) && (
              <>
                <Divider hidden />
                <div className='active-filters'>
                  <span style={{ fontSize: '12px', color: '#888', marginRight: '8px' }}>Filters:</span>
                  {search && (
                    <Label size='small' color='blue' onRemove={() => { setSearchInput(''); updateParams({ search: '', page: 1 }); }}>
                      Search: {search}
                    </Label>
                  )}
                  {role && (
                    <Label size='small' color='purple' onRemove={() => updateParams({ role: '', page: 1 })}>{role}</Label>
                  )}
                  {status && (
                    <Label size='small' color='green' onRemove={() => updateParams({ status: '', page: 1 })}>{status}</Label>
                  )}
                </div>
              </>
            )}
          </Segment>

          {/* User Table */}
          {loading ? (
            <Segment loading className='user-table-segment'>
              <div style={{ height: 300 }} />
            </Segment>
          ) : users.length === 0 ? (
            <Segment placeholder className='user-empty'>
              <Header icon>
                <Icon name='search' />
                No users found
              </Header>
              <p>Try adjusting your filters or add a new user.</p>
              <Button primary onClick={() => navigate('/users/create')}>
                <Icon name='plus' /> Add User
              </Button>
            </Segment>
          ) : (
            <>
              <Segment className='user-table-segment' style={{ padding: 0, overflow: 'hidden' }}>
                <Table celled striped className='user-table'>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width={4}>User</Table.HeaderCell>
                      <Table.HeaderCell width={3}>Role</Table.HeaderCell>
                      <Table.HeaderCell width={3}>Status</Table.HeaderCell>
                      <Table.HeaderCell width={3}>Teams</Table.HeaderCell>
                      <Table.HeaderCell width={2}>Joined</Table.HeaderCell>
                      <Table.HeaderCell width={1} textAlign='center'>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {users.map((user) => (
                      <Table.Row key={user.id} className='user-table-row'>
                        <Table.Cell>
                          <div className='user-cell' onClick={() => navigate(`/users/${user.id}`)}>
                            <Image src={user.avatar} circular className='user-avatar-small' />
                            <div className='user-cell-info'>
                              <div className='user-cell-name'>
                                {user.firstName} {user.lastName}
                              </div>
                              <div className='user-cell-email'>{user.email}</div>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={getRoleColor(user.role)} size='small'>{user.role}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={user.status === 'active' ? 'green' : 'grey'} size='small' circular empty
                            style={{ marginRight: 4 }}
                          />
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </Table.Cell>
                        <Table.Cell>
                          {user.teams && user.teams.length > 0 ? (
                            <div>
                              {user.teams.map((team, i) => (
                                <Label key={i} size='mini' color='teal' style={{ margin: '2px 2px' }}>
                                  {team}
                                </Label>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <span style={{ fontSize: '13px', color: '#666' }}>{user.joinedAt}</span>
                        </Table.Cell>
                        <Table.Cell textAlign='center'>
                          <Button size='small' icon as={Link} to={`/users/${user.id}/edit`}>
                            <Icon name='pencil' />
                          </Button>
                          <Button size='small' icon color='red' onClick={() => setDeleteTarget(user)}>
                            <Icon name='trash' />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Segment>

              {totalPages > 1 && (
                <div className='users-pagination'>
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

      <DeleteModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
        itemType='user'
        loading={actionLoading}
      />
    </div>
  );
};

export default UserContainer;
