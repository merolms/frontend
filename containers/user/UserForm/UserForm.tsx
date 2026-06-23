import { useEffect, useState } from "react";

import { fetchRoles } from "@/services/authService";
import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Save User",
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Student",
    phone: "",
    bio: "",
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions(roles.map((role) => ({ value: role.name, label: role.name })));
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

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email address";
    if (!formData.role) e.role = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {Object.keys(errors).length > 0 && (
        <div className="text-error flex items-center gap-2 text-sm">
          <span className="text-error">⚠</span> Please fix the errors below.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name" error={errors.firstName} required>
          <Input
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={errors.firstName ? "border-error" : ""}
          />
        </FormField>
        <FormField label="Last Name" error={errors.lastName} required>
          <Input
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={errors.lastName ? "border-error" : ""}
          />
        </FormField>
      </div>
      <FormField label="Email" error={errors.email} required>
        <Input
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={errors.email ? "border-error" : ""}
        />
      </FormField>
      <FormField label="Role" error={errors.role} required>
        <Select value={formData.role} onValueChange={(v) => handleChange("role", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Phone">
        <Input
          placeholder="+1 555-0100"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </FormField>
      <FormField label="Bio">
        <Input
          placeholder="Short bio..."
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </FormField>
      <FormActions onCancel={onCancel} loading={loading} submitLabel={submitLabel} />
    </form>
  );
};

export default UserForm;
