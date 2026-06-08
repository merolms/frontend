import { GraduationCap, Loader, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProfile } from "@/app/services/authService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { usePageTitle } from "@/hooks";

const Profile = () => {
  usePageTitle("Profile");
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
          <Loader className="text-text-muted animate-spin" size={20} />
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-end">
          <Button variant="default" size="sm" onClick={() => navigate("/settings")}>
            <Settings size={14} /> Settings
          </Button>
        </div>
      )}

      {!loading && (
        <Paper className="max-w-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar || reduxUser?.avatar} />
                <AvatarFallback className="text-base">
                  {((profile?.firstName || reduxUser?.firstName)?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-text-primary text-lg font-bold">
                  {profile?.firstName || reduxUser?.firstName}{" "}
                  {profile?.lastName || reduxUser?.lastName}
                </h2>
                <p className="text-text-muted text-xs">{profile?.email || reduxUser?.email}</p>
              </div>
            </div>
            <Button variant="default" size="sm" onClick={() => navigate("/settings")}>
              <Settings size={14} /> Edit Profile
            </Button>
          </div>

          {profile?.bio && <p className="text-text-secondary mt-4 text-xs">{profile.bio}</p>}

          <Button
            variant="default"
            size="sm"
            className="mt-4"
            onClick={() => navigate("/my-learning")}
          >
            <GraduationCap size={14} /> My Learning
          </Button>
        </Paper>
      )}
    </DashboardLayout>
  );
};

export default Profile;
