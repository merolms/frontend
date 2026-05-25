import React, { useState, useEffect } from 'react';
import { Form, Input, TextArea, Dropdown, Button, Message, Label } from 'semantic-ui-react';
import { mockCategories } from '../../../services/courseService';

const tagOptions = [
  'javascript', 'react', 'python', 'css', 'html', 'nodejs', 'typescript',
  'machine-learning', 'data-science', 'design', 'ui', 'ux', 'devops',
  'cloud', 'aws', 'docker', 'api', 'database', 'security',
].map((tag) => ({ key: tag, text: tag, value: tag }));

const categoryOptions = mockCategories.map((cat) => ({ key: cat, text: cat, value: cat }));

const CourseForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Course' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    coverImage: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Course title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
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

      <Form.Field required error={!!errors.title}>
        <label>Course Title</label>
        <Input
          name='title'
          placeholder='Enter a course name'
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <Label basic color='red' pointing='left'>{errors.title}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.description}>
        <label>Description</label>
        <TextArea
          name='description'
          placeholder='Tell something about this course'
          style={{ minHeight: 120 }}
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <Label basic color='red' pointing='left'>{errors.description}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.category}>
        <label>Category</label>
        <Dropdown
          name='category'
          placeholder='Select a category'
          fluid
          search
          selection
          options={categoryOptions}
          value={formData.category}
          onChange={handleChange}
        />
        {errors.category && <Label basic color='red' pointing='left'>{errors.category}</Label>}
      </Form.Field>

      <Form.Field>
        <label>Tags</label>
        <Dropdown
          name='tags'
          placeholder='Add tags (e.g., programming, design)'
          fluid
          multiple
          search
          selection
          options={tagOptions}
          value={formData.tags}
          onChange={handleChange}
        />
      </Form.Field>

      <Form.Field>
        <label>Cover Image URL</label>
        <Input
          name='coverImage'
          placeholder='https://example.com/image.jpg'
          value={formData.coverImage}
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

export default CourseForm;
