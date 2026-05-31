import React, { useState, useEffect } from "react";
import { t } from "@/styles/theme";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Loader, ChevronRight, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paper } from "@/components/ui/card";
import { fetchUserById, updateUser } from "@/app/services/userService";
import { fetchRoles } from "@/app/services/authService";
import { useToast } from "@/app/context/ToastContext";

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Student",
    phone: "",
    bio: "",
    status: 1,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles.map((r) => ({ value: r.name, label: r.name })));
      } catch (err) {
        setRoleOptions([
          { value: "Student", label: "Student" },
          { value: "Instructor", label: "Instructor" },
        ]);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setFetching(true);
        const data = await fetchUserById(id);
        setUser(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "Student",
          phone: data.phone || "",
          bio: data.bio || "",
          status: data.status !== undefined ? data.status : 1,
        });
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setFetching(false);
      }
    };
    loadUser();
  }, [id]);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updated = await updateUser(id, formData);
      addToast(`${formData.firstName} ${formData.lastName} updated successfully`, "success");
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="text-text-muted animate-spin" size={20} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit User" subtitle="Update the user details">
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/users")} className="text-primary hover:underline">
          Users
        </button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/users/${id}`)} className="text-primary hover:underline">
          {user?.firstName} {user?.lastName}
        </button>
        <ChevronRight size={12} />
        <span>Edit</span>
      </div>

      {error && (
        <div className="text-error mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <Paper className="max-w-2xl p-6">
        <h2 className="text-text-primary mb-1 text-base font-semibold">
          <Pencil size={16} className="mr-1 inline" style={{ color: t("accent") }} />
          Edit User
        </h2>
        <p className="text-text-muted mb-4 text-xs">Update the user details below.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-primary text-xs font-medium">First Name *</label>
              <Input
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-text-primary text-xs font-medium">Last Name *</label>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-text-primary text-xs font-medium">Email *</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-primary text-xs font-medium">Role</label>
              <Select value={formData.role} onValueChange={(v) => handleChange("role", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-text-primary text-xs font-medium">Status</label>
              <Select
                value={String(formData.status)}
                onValueChange={(v) => handleChange("status", parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-text-primary text-xs font-medium">Phone</label>
            <Input
              placeholder="+1 555-0100"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="text-text-primary text-xs font-medium">Bio</label>
            <Input
              placeholder="Short bio..."
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              onClick={() => navigate(`/users/${id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Paper>
    </DashboardLayout>
  );
};

export default UserEdit;
