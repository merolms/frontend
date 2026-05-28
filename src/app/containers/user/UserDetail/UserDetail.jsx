import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Paper, Breadcrumbs, Anchor, Button, Avatar, Group, Text, Stack, Badge, Alert, Loader } from '@mantine/core';
import { AlertCircle, Calendar, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { DeleteModal } from '@/app/containers/course/CourseActions/CourseActions';
import { fetchUserById, deleteUser } from '@/app/services/userService';
import { adminResetPassword } from '@/app/services/authService';
import { useToast } from '@/app/context/ToastContext';

const getRoleColor = (role) => { switch (role) { case 'Administrator': return 'red'; case 'Instructor': return 'blue'; case 'Team Lead': return 'purple'; case 'Student': return 'teal'; default: return 'gray'; } };

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUser = async () => { try { setLoading(true); const data = await fetchUserById(id); setUser(data); } catch (err) { setError(err.message || 'Failed to load user.'); } finally { setLoading(false); } };
  useEffect(() => { loadUser(); }, [id]);

  const handleDelete = async () => { if (!deleteTarget) return; try { setActionLoading(true); await deleteUser(deleteTarget.id); addToast(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`, 'error'); navigate('/users'); } catch (err) { console.error(err); } finally { setActionLoading(false); } };

  if (loading) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Loader /><Text>Loading...</Text></Paper></div></div>);
  if (error || !user) return (<div className='dashboard-layout'><SideBar /><div className='dashboard-main'><Paper p="lg" mt={40}><Alert icon={<AlertCircle size={16} />} color="red">{error || 'User not found'}</Alert><Button mt="md" onClick={() => navigate('/users')}>Back to Users</Button></Paper></div></div>);

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/users')}>Users</Anchor><span>{user.firstName} {user.lastName}</span></Breadcrumbs>

        <Paper p="lg" radius="md" withBorder mb="md">
          <Group justify="space-between">
            <Group gap={16}>
              <Avatar src={user.avatar} size={80} radius="xl" />
              <div>
                <Text size="xl" fw={700}>{user.firstName} {user.lastName}</Text>
                <Badge color={getRoleColor(user.role)} mt={4}>{user.role}</Badge>
                <Group gap={16} mt={8}>
                  <Text size="sm" c="dimmed"><Mail size={14} /> {user.email}</Text>
                  {user.phone && <Text size="sm" c="dimmed"><Phone size={14} /> {user.phone}</Text>}
                  <Text size="sm" c="dimmed"><Calendar size={14} /> {user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'}</Text>
                </Group>
              </div>
            </Group>
            <Group>
              <Button variant="default" component={Link} to={`/users/${id}/edit`} leftSection={<Pencil size={14} />}>Edit</Button>
              <Button color="red" variant="default" onClick={() => setDeleteTarget(user)} leftSection={<Trash2 size={14} />}>Delete</Button>
            </Group>
          </Group>
        </Paper>
      </div>

      <DeleteModal open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''} itemType='user' loading={actionLoading} />
    </div>
  );
};

export default UserDetail;
