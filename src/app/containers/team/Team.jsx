import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Segment, Icon, Button, Input, Dropdown, Pagination,
  Label, Image, Divider, Grid, Card, Header,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import TeamMemberAssignModal from '@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { mockFetchTeams, mockDeleteTeam } from '@/app/services/teamService';
import './Team.scss';

const statusOptions = [
  { key: 'all', text: 'All', value: '' },
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'inactive', text: 'Inactive', value: 'inactive' },
];

const sortOptions = [
  { key: 'newest', text: 'Newest First', value: 'newest' },
  { key: 'name', text: 'Name A-Z', value: 'name' },
  { key: 'members', text: 'Most Members', value: 'members' },
  { key: 'progress', text: 'Highest Progress', value: 'progress' },
];

const TeamContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [assignTeam, setAssignTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockFetchTeams({ search, status, sort, page, limit: 8 });
      setTeams(data.teams);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

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
      await mockDeleteTeam(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting team:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#33a163';
    if (progress >= 50) return '#f0a500';
    if (progress >= 25) return '#ff9800';
    return '#e53935';
  };

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onNavigate={(path) => navigate(path)} />

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
                value={status}
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

            {(status || search) && (
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
                    <Label size='small' color='green' onRemove={() => updateParams({ status: '', page: 1 })}>{status}</Label>
                  )}
                </div>
              </>
            )}
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
            <>
              <Grid columns={4} stackable className='team-grid'>
                {teams.map((team) => (
                  <Grid.Column key={team.id}>
                    <Card
                      className='team-card-item'
                      onClick={() => navigate(`/teams/${team.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className='team-card-header' style={{ background: team.color }}>
                        <Icon name='users' size='large' color='white' />
                        <Label
                          floating
                          circular
                          style={{ background: team.status === 'active' ? '#33a163' : '#999', color: '#fff', border: 'none' }}
                        >
                          {team.memberCount}
                        </Label>
                      </div>
                      <Card.Content>
                        <Card.Header>{team.name}</Card.Header>
                        <Card.Meta>
                          <span className='team-description'>{team.description}</span>
                        </Card.Meta>
                      </Card.Content>
                      <Card.Content extra>
                        <div className='team-card-stats'>
                          <div className='team-stat'>
                            <div className='team-stat-value'>{team.memberCount}</div>
                            <div className='team-stat-label'>Members</div>
                          </div>
                          <div className='team-stat'>
                            <div className='team-stat-value'>{team.coursesAssigned}</div>
                            <div className='team-stat-label'>Courses</div>
                          </div>
                          <div className='team-stat'>
                            <div className='team-stat-value' style={{ color: getProgressColor(team.avgProgress) }}>
                              {team.avgProgress}%
                            </div>
                            <div className='team-stat-label'>Progress</div>
                          </div>
                        </div>

                        {/* Member avatars */}
                        {team.members.length > 0 && (
                          <div className='team-avatars' style={{ marginTop: 12 }}>
                            {team.members.slice(0, 5).map((member) => (
                              <Image
                                key={member.id}
                                src={member.avatar}
                                circular
                                size='mini'
                                className='team-member-avatar'
                                title={`${member.firstName} ${member.lastName}`}
                              />
                            ))}
                            {team.members.length > 5 && (
                              <span style={{ fontSize: '11px', color: '#888', marginLeft: 4 }}>
                                +{team.members.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                ))}
              </Grid>

              {totalPages > 1 && (
                <div className='teams-pagination'>
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
