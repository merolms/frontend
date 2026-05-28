import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '@/app/context/ThemeContext';
import { Paper, TextInput, Button, Group, Title, Text, Stack, Select, Tabs, Avatar, Breadcrumbs,Anchor } from '@mantine/core';
import SideBar from '@/app/containers/SideBar/SideBar';
import { updateProfile, changePassword } from '@/app/services/authService';

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { mode, resolvedTheme, changeMode } = useTheme();
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <Breadcrumbs mb="md"><Anchor onClick={() => navigate('/profile')}>Profile</Anchor><span>Settings</span></Breadcrumbs>
        <Paper p="lg" radius="md" withBorder>
          <Tabs defaultValue="profile">
            <Tabs.List>
              <Tabs.Tab value="profile">Profile</Tabs.Tab>
              <Tabs.Tab value="password">Password</Tabs.Tab>
              <Tabs.Tab value="appearance">Appearance</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="profile" pt="md">
              <Group align="flex-start">
                <Avatar src={user?.avatar} size={80} radius="xl" />
                <Stack style={{ flex: 1 }}>
                  <TextInput label="First Name" value={profileForm.firstName} onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
                  <TextInput label="Last Name" value={profileForm.lastName} onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
                  <TextInput label="Email" value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                  <Button mt="sm" style={{ alignSelf: 'flex-start' }}>Save Changes</Button>
                </Stack>
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="password" pt="md">
              <Stack maw={400}>
                <TextInput label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
                <TextInput label="New Password" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} />
                <TextInput label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
                <Button mt="sm" style={{ alignSelf: 'flex-start' }}>Change Password</Button>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="appearance" pt="md">
              <Select label="Theme" value={mode} onChange={changeMode} data={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
              <Text size="sm" c="dimmed" mt="xs">Current: {resolvedTheme}</Text>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </div>
    </div>
  );
};

export default Settings;
