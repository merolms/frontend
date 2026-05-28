import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, Avatar, Group, Text, Stack, Badge, SimpleGrid, Progress, Button } from '@mantine/core';
import { IconSettings, IconSchool } from '@tabler/icons-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { getProfile } from '@/app/services/authService';
import './Profile.scss';

const Profile = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => { try { setLoading(true); const data = await getProfile(); setProfile(data); } catch (err) { console.error(err); } finally { setLoading(false); } };
    loadProfile();
  }, []);

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'><h1 className='page-title'>Profile</h1><p className='page-subtitle'>{profile?.firstName || reduxUser?.firstName} {profile?.lastName || reduxUser?.lastName}</p></div>
          <div className='header-right'><Button variant="default" leftSection={<IconSettings size={14} />} onClick={() => navigate('/settings')}>Settings</Button></div>
        </div>

        <div className='dashboard-content'>
          {loading ? (
            <Paper p="lg" radius="md"><Text>Loading...</Text></Paper>
          ) : (
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb="lg">
                <Group gap={16}>
                  <Avatar src={profile?.avatar || reduxUser?.avatar} size={80} radius="xl" />
                  <div>
                    <Text size="xl" fw={700}>{profile?.firstName || reduxUser?.firstName} {profile?.lastName || reduxUser?.lastName}</Text>
                    <Text c="dimmed">{profile?.email || reduxUser?.email}</Text>
                  </div>
                </Group>
                <Button variant="default" component={Link} to="/settings" leftSection={<IconSettings size={14} />}>Edit Profile</Button>
              </Group>
              {profile?.bio && <Text mb="md">{profile.bio}</Text>}
              <Button mt="sm" component={Link} to="/my-learning" variant="default" leftSection={<IconSchool size={14} />}>My Learning</Button>
            </Paper>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
