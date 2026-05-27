import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Label, Table, Divider, Header, Message,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { PermissionGuard } from '@/app/components/ProtectedRoute/ProtectedRoute';
import { fetchRoles, deleteRole } from '@/app/services/authService';

const RoleManagement = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRoles();
      setRoles(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load roles.');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(searchInput.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchInput.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRoles = filteredRoles.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id);
      setDeleteTarget(null);
      await loadRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
    }
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />

      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Roles & Permissions</h1>
            <p className='page-subtitle'>{filteredRoles.length} of {roles.length} roles</p>
          </div>
          <div className='header-right'>
            <PermissionGuard permissions={['roles.create']}>
              <Button icon primary onClick={() => navigate('/roles/create')}>
                <Icon name='plus' /> New Role
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className='dashboard-content'>
          {error && (
            <Message negative onDismiss={() => setError(null)}>
              <Icon name='warning circle' /> {error}
            </Message>
          )}

          <Segment className='role-filters' secondary>
            <div className='role-filters-row'>
              <form className='role-search-form' onSubmit={(e) => e.preventDefault()}>
                <Input
                  icon='search'
                  placeholder='Search roles...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fluid
                />
              </form>
            </div>
          </Segment>

          {loading ? (
            <Segment loading><h2>Loading roles...</h2></Segment>
          ) : filteredRoles.length === 0 ? (
            <Segment placeholder className='role-empty'>
              <Header icon>
                <Icon name='shield' />
                No roles found
              </Header>
              <p>Try adjusting your search.</p>
            </Segment>
          ) : (
            <>
              <Segment className='role-table-segment' style={{ padding: 0, overflow: 'hidden' }}>
                <Table celled striped className='role-table'>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width={3}>Role</Table.HeaderCell>
                      <Table.HeaderCell width={5}>Description</Table.HeaderCell>
                      <Table.HeaderCell width={2}>Permissions</Table.HeaderCell>
                      <Table.HeaderCell width={2}>Color</Table.HeaderCell>
                      <Table.HeaderCell width={2} textAlign='center'>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedRoles.map((role) => (
                      <Table.Row key={role.id}>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{role.name}</span>
                            {role.permissions && role.permissions.includes('*') && (
                              <Label color='red' size='tiny' circular style={{ padding: '2px 6px' }}>
                                <Icon name='star' size='mini' />
                              </Label>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell style={{ color: '#666', fontSize: '13px' }}>{role.description}</Table.Cell>
                        <Table.Cell>
                          <Button
                            size='tiny'
                            basic
                            onClick={() => setShowPermissionModal(role)}
                            style={{ fontSize: '12px' }}
                          >
                            <Icon name='eye' /> {role.permissions && role.permissions.includes('*') ? 'All' : `${(role.permissions || []).length} permissions`}
                          </Button>
                        </Table.Cell>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              display: 'inline-block', width: 16, height: 16, borderRadius: 3,
                              background: role.color || '#767676',
                            }} />
                            <span style={{ fontSize: '12px', color: '#888' }}>{role.color || 'default'}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell textAlign='center'>
                          <PermissionGuard permissions={['roles.edit']}>
                            <Button size='small' icon title='Edit' onClick={() => navigate(`/roles/${role.id}/edit`)}>
                              <Icon name='pencil' />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permissions={['roles.delete']}>
                            <Button size='small' icon color='red' title='Delete' onClick={() => setDeleteTarget(role)}>
                              <Icon name='trash' />
                            </Button>
                          </PermissionGuard>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Segment>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                  <Button size='small' basic disabled={safePage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                    <Icon name='chevron left' />
                  </Button>
                  <span style={{ fontSize: '13px', color: '#666' }}>Page {safePage} of {totalPages}</span>
                  <Button size='small' basic disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                    <Icon name='chevron right' />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Permission Detail Modal */}
      {showPermissionModal && (
        <div className='role-permission-modal-overlay' onClick={() => setShowPermissionModal(null)}>
          <div className='role-permission-modal' onClick={(e) => e.stopPropagation()}>
            <Header as='h3'>
              <Icon name='shield' />
              {showPermissionModal.name} — Permissions
            </Header>
            <Divider />
            {showPermissionModal.permissions && showPermissionModal.permissions.includes('*') ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Icon name='star' color='red' size='huge' />
                <p style={{ marginTop: 12, color: '#666' }}>This role has <strong>full administrative access</strong> to all features.</p>
              </div>
            ) : (
              <div className='role-permission-list'>
                {(showPermissionModal.permissions || []).map((perm) => (
                  <div key={perm} className='role-permission-item'>
                    <Icon name='check circle' color='green' />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            )}
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setShowPermissionModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className='role-delete-overlay' onClick={() => setDeleteTarget(null)}>
          <div className='role-delete-modal' onClick={(e) => e.stopPropagation()}>
            <Header as='h3' color='red'><Icon name='trash' /> Delete Role</Header>
            <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button color='red' onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
