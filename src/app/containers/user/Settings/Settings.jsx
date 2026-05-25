import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Header, Segment, Grid, Icon, Label, Image, Button,
  Divider, Form, Input, TextArea, Tab, Message,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { mockUpdateUser } from '@/app/services/userService';

const Settings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector((state) => state.auth.user);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailCourseUpdates: true,
    emailTeamActivity: true,
    emailAnnouncements: true,
    pushEnabled: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleProfileChange = (key, value) => {
    setProfileForm((p) => ({ ...p, [key]: value }));
  };

  const handlePasswordChange = (key, value) => {
    setPasswordForm((p) => ({ ...p, [key]: value }));
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await mockUpdateUser(user.id, profileForm);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      setSaving(false);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match.');
      setSaving(false);
      return;
    }
    try {
      // In static mode, password change always succeeds
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = () => {
    const url = prompt('Enter new avatar URL:', user?.avatar || '');
    if (url) {
      mockUpdateUser(user.id, { avatar: url }).then(() => {
        window.location.reload();
      }).catch(() => {});
    }
  };

  const panes = [
    {
      menuItem: { key: 'profile', icon: 'user', content: 'Profile' },
      render: () => (
        <Tab.Pane attached={false}>
          {error && <Message error onDismiss={() => setError(null)} style={{ marginBottom: 16 }}>{error}</Message>}
          {success && <Message success onDismiss={() => setSuccess(null)} style={{ marginBottom: 16 }}>{success}</Message>}

          <div className='settings-section'>
            <Header as='h4'>Profile Picture</Header>
            <div className='settings-avatar-row'>
              <Image src={user?.avatar} circular className='settings-avatar' />
              <div>
                <Button size='small' onClick={handleAvatarChange}>
                  <Icon name='camera' /> Change Photo
                </Button>
                <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
          </div>

          <Divider />

          <Form onSubmit={handleProfileSave} loading={saving}>
            <div className='settings-section'>
              <Header as='h4'>Personal Information</Header>
              <Form.Group widths='equal'>
                <Form.Field required>
                  <label>First Name</label>
                  <Input value={profileForm.firstName} onChange={(e) => handleProfileChange('firstName', e.target.value)} />
                </Form.Field>
                <Form.Field required>
                  <label>Last Name</label>
                  <Input value={profileForm.lastName} onChange={(e) => handleProfileChange('lastName', e.target.value)} />
                </Form.Field>
              </Form.Group>
              <Form.Field required>
                <label>Email</label>
                <Input type='email' value={profileForm.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
              </Form.Field>
              <Form.Field>
                <label>Phone</label>
                <Input value={profileForm.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} placeholder='+1 555-0100' />
              </Form.Field>
              <Form.Field>
                <label>Bio</label>
                <TextArea value={profileForm.bio} onChange={(e) => handleProfileChange('bio', e.target.value)} placeholder='Tell others about yourself...' style={{ minHeight: 80 }} />
              </Form.Field>
            </div>

            <div className='settings-actions'>
              <Button type='button' onClick={() => navigate('/profile')}>Cancel</Button>
              <Button type='submit' primary loading={saving}><Icon name='save' /> Save Profile</Button>
            </div>
          </Form>
        </Tab.Pane>
      ),
    },
    {
      menuItem: { key: 'password', icon: 'lock', content: 'Password' },
      render: () => (
        <Tab.Pane attached={false}>
          {error && <Message error onDismiss={() => setError(null)} style={{ marginBottom: 16 }}>{error}</Message>}
          {success && <Message success onDismiss={() => setSuccess(null)} style={{ marginBottom: 16 }}>{success}</Message>}

          <div className='settings-section'>
            <Header as='h4'>Change Password</Header>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Choose a strong password that you don't use anywhere else.</p>

            <Form onSubmit={handlePasswordSave} loading={saving}>
              <Form.Field required>
                <label>Current Password</label>
                <Input type='password' value={passwordForm.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} />
              </Form.Field>
              <Form.Field required>
                <label>New Password</label>
                <Input type='password' value={passwordForm.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} />
              </Form.Field>
              <Form.Field required>
                <label>Confirm New Password</label>
                <Input type='password' value={passwordForm.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <Label basic color='red' pointing='left'>Passwords do not match</Label>
                )}
              </Form.Field>
              <div className='settings-actions'>
                <Button type='button' onClick={() => navigate('/profile')}>Cancel</Button>
                <Button type='submit' primary loading={saving}><Icon name='lock' /> Change Password</Button>
              </div>
            </Form>
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: { key: 'notifications', icon: 'bell', content: 'Notifications' },
      render: () => (
        <Tab.Pane attached={false}>
          <div className='settings-section'>
            <Header as='h4'>Email Notifications</Header>
            <div className='settings-toggle-list'>
              <div className='settings-toggle-item'>
                <div>
                  <strong>Course Updates</strong>
                  <p style={{ fontSize: 12, color: '#888' }}>Get notified when courses you're enrolled in are updated.</p>
                </div>
                <input type='checkbox' checked={notifications.emailCourseUpdates} onChange={(e) => setNotifications((p) => ({ ...p, emailCourseUpdates: e.target.checked }))} />
              </div>
              <Divider />
              <div className='settings-toggle-item'>
                <div>
                  <strong>Team Activity</strong>
                  <p style={{ fontSize: 12, color: '#888' }}>Get notified about activity in your teams.</p>
                </div>
                <input type='checkbox' checked={notifications.emailTeamActivity} onChange={(e) => setNotifications((p) => ({ ...p, emailTeamActivity: e.target.checked }))} />
              </div>
              <Divider />
              <div className='settings-toggle-item'>
                <div>
                  <strong>Platform Announcements</strong>
                  <p style={{ fontSize: 12, color: '#888' }}>Receive news and announcements from MeroEdu.</p>
                </div>
                <input type='checkbox' checked={notifications.emailAnnouncements} onChange={(e) => setNotifications((p) => ({ ...p, emailAnnouncements: e.target.checked }))} />
              </div>
            </div>
            <div className='settings-actions'>
              <Button primary onClick={() => { setSuccess('Notification preferences saved.'); setTimeout(() => setSuccess(null), 3000); }}>
                <Icon name='save' /> Save Preferences
              </Button>
            </div>

            <Divider />

            <Header as='h4'>Push Notifications</Header>
            <div className='settings-toggle-item'>
              <div>
                <strong>Browser Push Notifications</strong>
                <p style={{ fontSize: 12, color: '#888' }}>Receive real-time notifications in your browser.</p>
              </div>
              <input type='checkbox' checked={notifications.pushEnabled} onChange={(e) => setNotifications((p) => ({ ...p, pushEnabled: e.target.checked }))} />
            </div>
          </div>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <div className='settings-page'>
          <div className='settings-header'>
            <h1 className='page-title'>Settings</h1>
            <p className='page-subtitle'>Manage your account preferences</p>
          </div>

          <Segment className='settings-tabs-card'>
            <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
          </Segment>
        </div>

      </div>
    </div>
  );
};

export default Settings;
