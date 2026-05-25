import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, TextArea, Dropdown, Icon, Label, Message } from 'semantic-ui-react';
import { getCategoryColorOptions, getCategoryIconOptions } from '@/app/services/categoryService';

const CategoryForm = ({ category = null, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: getCategoryColorOptions()[0],
    icon: 'folder',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        color: category.color || getCategoryColorOptions()[0],
        icon: category.icon || 'folder',
      });
    }
  }, [category]);

  const handleChange = (e, { name, value }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Auto-generate slug from name
  const handleNameChange = (e, { value }) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm((prev) => ({ ...prev, name: value, slug: slug }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onSubmit(form);
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  const colorOptions = getCategoryColorOptions().map((c) => ({
    key: c,
    value: c,
    content: (
      <span>
        <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: c, marginRight: 8, verticalAlign: 'middle' }} />
        {c}
      </span>
    ),
  }));

  const iconOptions = getCategoryIconOptions.map((ic) => ({
    key: ic,
    value: ic,
    text: ic,
    content: (
      <span>
        <Icon name={ic} size='mini' style={{ marginRight: 6 }} />
        {ic}
      </span>
    ),
  }));

  return (
    <Modal open={true} onClose={onClose} size='small' closeOnDimmerClick={!loading}>
      <Modal.Header>
        {isEditing ? (
          <><Icon name='pencil' color='blue' /> Edit Category</>
        ) : (
          <><Icon name='plus circle' color='green' /> Create Category</>
        )}
      </Modal.Header>
      <Modal.Content>
        <Form loading={loading} error={Object.keys(errors).length > 0}>
          {errors.submit && <Message error size='small' onDismiss={() => setErrors((p) => ({ ...p, submit: null }))}>{errors.submit}</Message>}
          {Object.keys(errors).length > 0 && !errors.submit && <Message error size='small'><p>Please fix the errors below.</p></Message>}

          <Form.Field required error={!!errors.name}>
            <label>Name</label>
            <Input name='name' placeholder='e.g., Web Development' value={form.name} onChange={handleNameChange} />
            {errors.name && <Label basic color='red' pointing='left'>{errors.name}</Label>}
          </Form.Field>

          <Form.Field required error={!!errors.slug}>
            <label>Slug</label>
            <Input name='slug' placeholder='e.g., web-development' value={form.slug} onChange={handleChange} />
            {errors.slug && <Label basic color='red' pointing='left'>{errors.slug}</Label>}
            <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>URL-friendly identifier, auto-generated from name</p>
          </Form.Field>

          <Form.Field>
            <label>Description</label>
            <TextArea name='description' placeholder='What kind of courses belong in this category?' style={{ minHeight: 80 }} value={form.description} onChange={handleChange} />
          </Form.Field>

          <Form.Field>
            <label>Color</label>
            <Dropdown name='categoryColor' selection options={colorOptions} value={form.color} onChange={(e, { value }) => handleChange(e, { name: 'color', value })} />
            <div style={{ marginTop: 6 }}>
              <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: 4, background: form.color, border: '1px solid #ddd', verticalAlign: 'middle' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>Preview</span>
            </div>
          </Form.Field>

          <Form.Field>
            <label>Icon</label>
            <Dropdown name='categoryIcon' selection search options={iconOptions} value={form.icon} onChange={(e, { value }) => handleChange(e, { name: 'icon', value })} />
            <Icon name={form.icon} size='large' color='grey' style={{ marginTop: 6 }} />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button primary onClick={handleSubmit} loading={loading}>
          {isEditing ? <><Icon name='save' /> Save Changes</> : <><Icon name='plus' /> Create Category</>}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default CategoryForm;
