import React, { useState, useEffect } from 'react';
import { Form, Input, Dropdown, Button, Message, Label } from 'semantic-ui-react';
import { fetchRoles } from '@/app/services/authService';

const UserForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save User' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Student',
    phone: '',
    bio: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        const opts = roles.map((role) => ({ key: role.name, text: role.name, value: role.name }));
        setRoleOptions(opts);
      } catch (err) {
        // Fallback to default roles
        setRoleOptions([
          { key: 'Student', text: 'Student', value: 'Student' },
          { key: 'Instructor', text: 'Instructor', value: 'Instructor' },
          { key: 'Team Lead', text: 'Team Lead', value: 'Team Lead' },
          { key: 'Administrator', text: 'Administrator', value: 'Administrator' },
        ]);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e, { name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <Form onSubmit={handleSubmit} loading={loading} error={Object.keys(errors).length > 0}>
      {Object.keys(errors).length > 0 && (
        <Message error size='small'>
          <p>Please fix the errors below.</p>
        </Message>
      )}

      <Form.Group widths='equal'>
        <Form.Field required error={!!errors.firstName}>
          <label>First Name</label>
          <Input
            name='firstName'
            placeholder='John'
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <Label basic color='red' pointing='left'>{errors.firstName}</Label>}
        </Form.Field>

        <Form.Field required error={!!errors.lastName}>
          <label>Last Name</label>
          <Input
            name='lastName'
            placeholder='Doe'
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <Label basic color='red' pointing='left'>{errors.lastName}</Label>}
        </Form.Field>
      </Form.Group>

      <Form.Field required error={!!errors.email}>
        <label>Email</label>
        <Input
          name='email'
          type='email'
          placeholder='john@example.com'
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <Label basic color='red' pointing='left'>{errors.email}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.role}>
        <label>Role</label>
        <Dropdown
          name='role'
          placeholder='Select a role'
          selection
          options={roleOptions}
          value={formData.role}
          onChange={handleChange}
        />
        {errors.role && <Label basic color='red' pointing='left'>{errors.role}</Label>}
      </Form.Field>

      <Form.Field>
        <label>Phone</label>
        <Input
          name='phone'
          placeholder='+1 555-0100'
          value={formData.phone}
          onChange={handleChange}
          pattern='[0-9+\-() ]*'
          title='Only digits, spaces, +, -, (, ) allowed'
        />
      </Form.Field>

      <Form.Field>
        <label>Bio</label>
        <Input
          name='bio'
          placeholder='Short bio...'
          value={formData.bio}
          onChange={handleChange}
        />
      </Form.Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        {onCancel && (
          <Button type='button' onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type='submit' primary loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;
