import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/app/context/ThemeContext";
import { changePassword, updateProfile } from "@/app/services/authService";
import { useToast } from "@/app/context/ToastContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setAuth } from "@/redux/slices/authSlice";
import { usePageTitle } from "@/hooks";

const Settings = () => {
  usePageTitle("Settings");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { mode, resolvedTheme, changeMode } = useTheme();
  const { addToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleSaveProfile = async () => {
    setProfileError(null);
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileError("First name and last name are required.");
      return;
    }
    if (!profileForm.email.trim()) {
      setProfileError("Email is required.");
      return;
    }
    setProfileLoading(true);
    try {
      const updated = await updateProfile(profileForm);
      const newUser = updated?.user || { ...user, ...profileForm };
      dispatch(setAuth({ user: newUser, token: user?.token }));
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      addToast("Profile updated successfully", "success");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      addToast("Password changed successfully", "success");
    } catch (err) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account settings">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/profile")} className="text-primary hover:underline">
          Profile
        </button>
        <ChevronRight size={12} />
        <span>Settings</span>
      </div>

      <Paper className="max-w-2xl p-6">
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
                <AvatarFallback className="text-base">
                  {(user?.firstName?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                {profileError && <FormErrorBanner message={profileError} />}
                <div>
                  <label className="text-text-primary text-xs font-medium">First Name</label>
                  <Input
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-text-primary text-xs font-medium">Last Name</label>
                  <Input
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-text-primary text-xs font-medium">Email</label>
                  <Input
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <Button size="sm" onClick={handleSaveProfile} disabled={profileLoading}>
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password">
            <div className="max-w-sm space-y-3">
              {passwordError && <FormErrorBanner message={passwordError} />}
              <div>
                <label className="text-text-primary text-xs font-medium">Current Password</label>
                <Input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-text-primary text-xs font-medium">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-text-primary text-xs font-medium">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              <Button size="sm" onClick={handleChangePassword} disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="space-y-2">
              <label className="text-text-primary text-xs font-medium">Theme</label>
              <Select value={mode} onValueChange={changeMode}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-text-muted text-xs">Current: {resolvedTheme}</p>
            </div>
          </TabsContent>
        </Tabs>
      </Paper>
    </DashboardLayout>
  );
};

export default Settings;
