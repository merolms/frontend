import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Dropdown, Pagination,
  Label, Table, Image, Divider, Header, Message,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchUsers, deleteUser } from '@/app/services/userService';
import { fetchRoles } from '@/app/services/authService';
import './User.scss';

const statusOptions = [
  { key: 'all', text: 'All Status', value: '' },
  { key: 'active', text: 'Active', value: '1' },
  { key: 'inactive', text: 'Inactive', value: '0' },
];

const sortOptions = [
  { key: 'joined', text: 'Newest First', value: 'joined' },
  { key: 'name', text: 'Name A-Z', value: 'name' },
  { key: 'email', text: 'Email A-Z', value: 'email' },
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
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState([{ key: 'all', text: 'All Roles', value: '' }]);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || '';
  const statusFilter = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';

  const [searchInput, setSearchInput] = useState(search);

  // Load role options for filter dropdown from backend
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        const opts = [
          { key: 'all', text: 'All Roles', value: '' },
          ...roles.map((r) => ({ key: r.name, text: r.name, value: r.name })),
        ];
        setRoleOptions(opts);
      } catch (err) {
        console.error('Error loading roles:', err);
      }
    };
    loadRoles();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { start: (page - 1) * 10, limit: 10 };
      if (sort) params.sort = sort;
      const data = await fetchUsers(params);
      // Backend returns UserResponse[] directly
      const userList = Array.isArray(data) ? data : [];
      // Client-side filter by role/status if backend doesn't support it
      let filtered = userList;
      if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
      if (statusFilter) filtered = filtered.filter((u) => String(u.status) === statusFilter);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            (u.firstName || '').toLowerCase().includes(q) ||
            (u.lastName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q)
        );
      }
      setUsers(filtered);
      setTotal(filtered.length);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, sort, page]);

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
      await deleteUser(deleteTarget.id);
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
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />

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
          {error && (
            <Message negative onDismiss={() => setError(null)}>
              <Icon name='warning circle' /> {error}
            </Message>
          )}

          {/* Filters */}
          <Segment className='user-filters' secondary>
            <div className='user-filters-row'>
              <form onSubmit={handleSearch} className='user-search-form'>
                <Input
                  icon='search'
                  placeholder='Search by name, email...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fluid
                />
              </form>
              <Dropdown
                placeholder='Role'
                selection
                options={roleOptions}
                value={roleFilter}
                onChange={(e, { value }) => updateParams({ role: value, page: 1 })}
                className='user-filter-dropdown'
              />
              <Dropdown
                placeholder='Status'
                selection
                options={statusOptions}
                value={statusFilter}
                onChange={(e, { value }) => updateParams({ status: value, page: 1 })}
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
            <Segment className='user-table-segment' style={{ padding: 0, overflow: 'hidden' }}>
              <Table celled striped className='user-table'>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={4}>User</Table.HeaderCell>
                    <Table.HeaderCell width={3}>Role</Table.HeaderCell>
                    <Table.HeaderCell width={3}>Status</Table.HeaderCell>
                    <Table.HeaderCell width={3}>Joined</Table.HeaderCell>
                    <Table.HeaderCell width={1} textAlign='center'>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user.id} className='user-table-row'>
                      <Table.Cell>
                        <div className='user-cell' onClick={() => navigate(`/users/${user.id}`)}>
                          <Image src={user.avatar || 'https://i.pravatar.cc/150?img=1'} circular className='user-avatar-small' />
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
                        <Label color={user.status === 1 ? 'green' : 'grey'} size='small' circular empty style={{ marginRight: 4 }} />
                        {user.status === 1 ? 'Active' : 'Inactive'}
                      </Table.Cell>
                      <Table.Cell>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                          {user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'}
                        </span>
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
