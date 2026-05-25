import React, { useState, useEffect } from 'react';
import { Form, Input, TextArea, Button, Message, Label, Grid, Icon, Segment } from 'semantic-ui-react';
import { permissionCatalog } from '@/app/services/authService';
import { mockTeamColors } from '@/app/services/teamService';


const RoleForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Role' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: mockTeamColors[0],
    permissions: [],
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [expandedDomains, setExpandedDomains] = useState(
    // Expand all by default
    Object.keys(permissionCatalog)
  );

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.permissions.length === 0) newErrors.permissions = 'Select at least one permission';
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

  const togglePermission = (permKey) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes(permKey)
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: perms };
    });
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: null }));
    }
  };

  const toggleDomain = (domainKey) => {
    const domainPerms = permissionCatalog[domainKey].permissions.map((p) => p.key);
    const allSelected = domainPerms.every((p) => formData.permissions.includes(p));

    setFormData((prev) => {
      const perms = allSelected
        ? prev.permissions.filter((p) => !domainPerms.includes(p))
        : [...new Set([...prev.permissions, ...domainPerms])];
      return { ...prev, permissions: perms };
    });
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: null }));
    }
  };

  const toggleExpand = (domainKey) => {
    setExpandedDomains((prev) =>
      prev.includes(domainKey)
        ? prev.filter((d) => d !== domainKey)
        : [...prev, domainKey]
    );
  };

  const getDomainSelectionState = (domainKey) => {
    const domainPerms = permissionCatalog[domainKey].permissions.map((p) => p.key);
    const selectedCount = domainPerms.filter((p) => formData.permissions.includes(p)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === domainPerms.length) return 'all';
    return 'partial';
  };

  const totalSelected = formData.permissions.length;
  const totalAvailable = Object.values(permissionCatalog).reduce(
    (sum, d) => sum + d.permissions.length,
    0
  );

  return (
    <Form onSubmit={handleSubmit} loading={loading} error={Object.keys(errors).length > 0}>
      {Object.keys(errors).length > 0 && (
        <Message error size='small'>
          <p>Please fix the errors below.</p>
        </Message>
      )}

      {/* Basic Info */}
      <Form.Field required error={!!errors.name}>
        <label>Role Name</label>
        <Input
          name='name'
          placeholder='e.g., Content Manager'
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <Label basic color='red' pointing='left'>{errors.name}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.description}>
        <label>Description</label>
        <TextArea
          name='description'
          placeholder='What can this role do?'
          style={{ minHeight: 80 }}
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <Label basic color='red' pointing='left'>{errors.description}</Label>}
      </Form.Field>

      <Form.Field>
        <label>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {mockTeamColors.map((color) => (
            <button
              key={color}
              type='button'
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: color,
                border: formData.color === color ? '3px solid #333' : '1px solid #ddd',
                cursor: 'pointer',
                padding: 0,
              }}
              title={color}
            />
          ))}
        </div>
      </Form.Field>

      {/* Permission Matrix */}
      <div style={{ marginTop: 24 }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
            Permissions
            {errors.permissions && <Label basic color='red' pointing='left' style={{ marginLeft: 8 }}>{errors.permissions}</Label>}
          </span>
          <span style={{ fontSize: 12, color: '#888' }}>
            {totalSelected} of {totalAvailable} selected
          </span>
        </label>

        <Segment className='permission-matrix' style={{ padding: 0, overflow: 'hidden' }}>
          {Object.entries(permissionCatalog).map(([domainKey, domain]) => {
            const state = getDomainSelectionState(domainKey);
            const isExpanded = expandedDomains.includes(domainKey);

            return (
              <div key={domainKey} className='permission-domain'>
                {/* Domain Header */}
                <div
                  className='permission-domain-header'
                  onClick={() => toggleExpand(domainKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name={isExpanded ? 'chevron down' : 'chevron right'} size='small' color='grey' />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{domain.label}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      ({domain.permissions.filter((p) => formData.permissions.includes(p.key)).length}/{domain.permissions.length})
                    </span>
                  </div>
                  <Button
                    size='mini'
                    compact
                    onClick={(e) => { e.stopPropagation(); toggleDomain(domainKey); }}
                    color={state === 'all' ? 'green' : state === 'partial' ? 'yellow' : 'grey'}
                    style={{ fontSize: '10px', padding: '4px 8px' }}
                  >
                    {state === 'all' ? 'All' : state === 'partial' ? 'Partial' : 'None'}
                  </Button>
                </div>

                {/* Permissions */}
                {isExpanded && (
                  <div className='permission-domain-body' style={{ padding: '8px 16px' }}>
                    <Grid columns={2} stackable>
                      {domain.permissions.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.key);
                        return (
                          <Grid.Column key={perm.key} style={{ padding: '6px 8px' }}>
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#555',
                              }}
                            >
                              <input
                                type='checkbox'
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{perm.label}</span>
                              <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'monospace', marginLeft: 'auto' }}>
                                {perm.key}
                              </span>
                            </label>
                          </Grid.Column>
                        );
                      })}
                    </Grid>
                  </div>
                )}
              </div>
            );
          })}
        </Segment>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
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

export default RoleForm;
