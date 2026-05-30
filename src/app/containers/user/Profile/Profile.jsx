import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, GraduationCap, Loader } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Paper } from '@/components/ui/card';
import { getProfile } from '@/app/services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try { setLoading(true); const data = await getProfile(); setProfile(data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  return (
    <DashboardLayout
      title="Profile"
      subtitle={`${profile?.firstName || reduxUser?.firstName} ${profile?.lastName || reduxUser?.lastName}`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-text-muted" size={20} />
        </div>
      ) : (
        <div className="flex items-center justify-end mb-4">
          <Button variant="default" size="sm" onClick={() => navigate('/settings')}>
            <Settings size={14} /> Settings
          </Button>
        </div>
      )}

      {!loading && (
        <Paper className="p-6 max-w-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar || reduxUser?.avatar} />
                <AvatarFallback className="text-base">
                  {((profile?.firstName || reduxUser?.firstName)?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {profile?.firstName || reduxUser?.firstName} {profile?.lastName || reduxUser?.lastName}
                </h2>
                <p className="text-xs text-text-muted">{profile?.email || reduxUser?.email}</p>
              </div>
            </div>
            <Button variant="default" size="sm" onClick={() => navigate('/settings')}>
              <Settings size={14} /> Edit Profile
            </Button>
          </div>

          {profile?.bio && <p className="text-xs text-text-secondary mt-4">{profile.bio}</p>}

          <Button
            variant="default"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/my-learning')}
          >
            <GraduationCap size={14} /> My Learning
          </Button>
        </Paper>
      )}
    </DashboardLayout>
  );
};

export default Profile;
