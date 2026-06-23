import { ChevronRight, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/context/ToastContext";
import { fetchRoles } from "@/services/authService";
import { createUser } from "@/services/userService";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/styles/theme";

const UserCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Student",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles.map((r) => ({ value: r.name, label: r.name })));
      } catch {
        setRoleOptions([
          { value: "Student", label: "Student" },
          { value: "Instructor", label: "Instructor" },
          { value: "Team Lead", label: "Team Lead" },
          { value: "Administrator", label: "Administrator" },
        ]);
      }
    };
    loadRoles();
  }, []);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const user = await createUser(formData);
      addToast(`${formData.firstName} ${formData.lastName} created successfully`, "success");
      navigate(`/users/${user.id}`);
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Create User"
      subtitle="Fill in the details below to create a new user account"
    >
      <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
        <button onClick={() => navigate("/users")} className="text-primary hover:underline">
          Users
        </button>
        <ChevronRight size={12} />
        <span>Create User</span>
      </div>

      <Paper className="max-w-2xl p-6">
        <h2 className="text-text-primary mb-1 text-base font-semibold">
          <UserPlus size={16} className="mr-1 inline" style={{ color: t("primary") }} />
          Create New User
        </h2>
        <p className="text-text-muted mb-4 text-xs">
          Fill in the details below to create a new user account.
        </p>

        {error && <p className="text-error mb-3 text-xs">{error}</p>}

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
          <div>
            <label className="text-text-primary text-xs font-medium">Password *</label>
            <Input
              type="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>
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
            <label className="text-text-primary text-xs font-medium">Phone</label>
            <Input
              placeholder="+1 555-0100"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              onClick={() => navigate("/users")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </Paper>
    </DashboardLayout>
  );
};

export default UserCreate;
