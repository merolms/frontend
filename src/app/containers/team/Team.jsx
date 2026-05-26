import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Dropdown, Pagination,
  Label, Image, Divider, Header, Grid, Card, Message,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamMemberAssignModal from '@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchTeams, deleteTeam } from '@/app/services/teamService';
import './Team.scss';

const statusOptions = [
  { key: 'all', text: 'All', value: '' },
  { key: 'active', text: 'Active', value: '1' },
  { key: 'inactive', text: 'Inactive', value: '0' },
];

const sortOptions = [
  { key: 'newest', text: 'Newest First', value: 'newest' },
  { key: 'name', text: 'Name A-Z', value: 'name' },
];

const TeamContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const [assignTeam, setAssignTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { start: (page - 1) * 8, limit: 8 };
      if (sort) params.sort = sort;
      const data = await fetchTeams(params);
      const teamList = Array.isArray(data) ? data : [];
      // Client-side filtering
      let filtered = teamList;
      if (statusFilter) filtered = filtered.filter((t) => String(t.status) === statusFilter);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) => (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        );
      }
      setTeams(filtered);
      setTotal(filtered.length);
    } catch (err) {
      setError(err.message || 'Failed to load teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sort, page]);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteTeam(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting team:', err);
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
            <h1 className='page-title'>Teams</h1>
            <p className='page-subtitle'>{total} team{total !== 1 ? 's' : ''} total</p>
          </div>
          <div className='header-right'>
            <Button icon primary onClick={() => navigate('/teams/create')}>
              <Icon name='plus' /> New Team
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
          <Segment className='team-filters' secondary>
            <div className='team-filters-row'>
              <form onSubmit={handleSearch} className='team-search-form'>
                <Input
                  icon='search'
                  placeholder='Search teams...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fluid
                />
              </form>
              <Dropdown
                placeholder='Status'
                selection
                options={statusOptions}
                value={statusFilter}
                onChange={(e, { value }) => updateParams({ status: value, page: 1 })}
                className='team-filter-dropdown'
              />
              <Dropdown
                placeholder='Sort'
                selection
                options={sortOptions}
                value={sort}
                onChange={(e, { value }) => updateParams({ sort: value, page: 1 })}
                className='team-filter-dropdown'
              />
              <Button
                basic
                onClick={() => { setSearchInput(''); setSearchParams(new URLSearchParams()); }}
              >
                Clear
              </Button>
            </div>
          </Segment>

          {/* Teams Grid */}
          {loading ? (
            <Segment loading className='team-grid-segment'>
              <Grid columns={4} stackable>
                {[...Array(4)].map((_, i) => (
                  <Grid.Column key={i}>
                    <Card>
                      <div style={{ height: 120, background: '#f0f0f0' }} />
                      <Card.Content>
                        <div style={{ height: 20, background: '#f0f0f0', marginBottom: 8 }} />
                        <div style={{ height: 14, background: '#f0f0f0' }} />
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                ))}
              </Grid>
            </Segment>
          ) : teams.length === 0 ? (
            <Segment placeholder className='team-empty'>
              <Header icon>
                <Icon name='users' />
                No teams found
              </Header>
              <p>Try adjusting your filters or create a new team.</p>
              <Button primary onClick={() => navigate('/teams/create')}>
                <Icon name='plus' /> Create Team
              </Button>
            </Segment>
          ) : (
            <div className='teams-grid'>
              {teams.map((team) => (
                <div key={team.id} className='team-card' onClick={() => navigate(`/teams/${team.id}`)}>
                  <div className='team-card-header' style={{ background: team.color || '#2185d0' }}>
                    <Icon name='users' size='large' color='white' />
                    <span className={`team-card-badge ${team.status === 1 ? 'active' : 'inactive'}`}>
                      {team.memberCount || 0}
                    </span>
                  </div>
                  <div className='team-card-body'>
                    <h3 className='team-card-title'>{team.name}</h3>
                    <p className='team-card-desc'>{team.description || 'No description'}</p>
                  </div>
                  <div className='team-card-footer'>
                    <div className='team-card-stats'>
                      <div className='team-stat'>
                        <div className='team-stat-value'>{team.memberCount || 0}</div>
                        <div className='team-stat-label'>Members</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Member Assignment Modal */}
      {assignTeam && (
        <TeamMemberAssignModal
          open={!!assignTeam}
          onClose={() => setAssignTeam(null)}
          team={assignTeam}
          onUpdated={fetchData}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name}
        itemType='team'
        loading={actionLoading}
      />
    </div>
  );
};

export default TeamContainer;
