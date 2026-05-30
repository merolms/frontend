import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/app/context/ThemeContext';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Paper } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Settings = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { mode, resolvedTheme, changeMode } = useTheme();
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account settings">
      <div className="flex items-center gap-1 text-xs text-text-muted mb-4">
        <button onClick={() => navigate('/profile')} className="text-primary hover:underline">Profile</button>
        <ChevronRight size={12} />
        <span>Settings</span>
      </div>

      <Paper className="p-6 max-w-2xl">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-base">{(user?.firstName?.[0] || 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-primary">First Name</label>
                  <Input value={profileForm.firstName} onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-primary">Last Name</label>
                  <Input value={profileForm.lastName} onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-primary">Email</label>
                  <Input value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <Button size="sm">Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password">
            <div className="space-y-3 max-w-sm">
              <div>
                <label className="text-xs font-medium text-text-primary">Current Password</label>
                <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-text-primary">New Password</label>
                <Input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-text-primary">Confirm New Password</label>
                <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
              </div>
              <Button size="sm">Change Password</Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-primary">Theme</label>
              <Select value={mode} onValueChange={changeMode}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted">Current: {resolvedTheme}</p>
            </div>
          </TabsContent>
        </Tabs>
      </Paper>
    </DashboardLayout>
  );
};

export default Settings;
