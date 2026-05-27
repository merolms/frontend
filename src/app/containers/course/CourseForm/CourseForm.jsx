import React, { useState, useEffect } from 'react';
import { Form, Input, TextArea, Dropdown, Button, Image, Message, Label, Icon } from 'semantic-ui-react';
import { fetchCategories } from '@/app/services/categoryService';
import UnsplashPicker from '@/app/containers/course/components/UnsplashPicker';

const tagOptions = [
  'javascript', 'react', 'python', 'css', 'html', 'nodejs', 'typescript',
  'machine-learning', 'data-science', 'design', 'ui', 'ux', 'devops',
  'cloud', 'aws', 'docker', 'api', 'database', 'security',
].map((tag) => ({ key: tag, text: tag, value: tag }));

const CourseForm = ({ initialData = null, onSubmit, onCancel, loading = false, submitLabel = 'Save Course' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    coverImage: '',
    ...initialData,
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
    // Load active categories
    fetchCategories({ status: 'active' }).then((cats) => {
      setCategoryOptions(cats.map((c) => ({ key: c.name, text: c.name, value: c.name })));
    }).catch(() => {});
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Course title is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (e, { name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return (
    <Form onSubmit={handleSubmit} loading={loading} error={Object.keys(errors).length > 0}>
      {Object.keys(errors).length > 0 && (
        <Message error size='small'><p>Please fix the errors below.</p></Message>
      )}

      <Form.Field required error={!!errors.title}>
        <label>Course Title</label>
        <Input name='title' placeholder='e.g., Advanced React Patterns' value={formData.title} onChange={handleChange} />
        {errors.title && <Label basic color='red' pointing='left'>{errors.title}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.description}>
        <label>Description</label>
        <TextArea name='description' placeholder='What will students learn?' style={{ minHeight: 120 }} value={formData.description} onChange={handleChange} />
        {errors.description && <Label basic color='red' pointing='left'>{errors.description}</Label>}
      </Form.Field>

      <Form.Field required error={!!errors.category}>
        <label>Category</label>
        <Dropdown name='category' placeholder='Select a category' fluid search selection options={categoryOptions} value={formData.category} onChange={handleChange} />
        {errors.category && <Label basic color='red' pointing='left'>{errors.category}</Label>}
      </Form.Field>

      <Form.Field>
        <label>Tags</label>
        <Dropdown name='tags' placeholder='Add tags to help discovery' fluid multiple search selection options={tagOptions} value={formData.tags} onChange={handleChange} />
      </Form.Field>

      <Form.Field>
        <label>Cover Image</label>
        <div className='cover-image-field'>
          <Input
            name='coverImage'
            placeholder='https://example.com/cover.jpg'
            value={formData.coverImage}
            onChange={handleChange}
            className='cover-image-input'
            action={
              <Button
                type='button'
                color='blue'
                onClick={() => setUnsplashOpen(true)}
                disabled={loading}
              >
                <Icon name='image' /> Unsplash
              </Button>
            }
          />
        </div>
        {formData.coverImage && (
          <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
            <Image src={formData.coverImage} fluid rounded style={{ maxHeight: 180, objectFit: 'cover' }} />
            <Button
              size='mini'
              color='red'
              icon='trash'
              className='cover-remove-btn'
              onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
            />
          </div>
        )}
        <UnsplashPicker
          open={unsplashOpen}
          onClose={() => setUnsplashOpen(false)}
          onSelect={(url) => {
            setFormData(prev => ({ ...prev, coverImage: url }));
            setUnsplashOpen(false);
          }}
          initialQuery={formData.title || 'education'}
        />
      </Form.Field>

      <div className='course-form-actions'>
        {onCancel && <Button type='button' onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type='submit' primary loading={loading}>{submitLabel}</Button>
      </div>
    </Form>
  );
};

export default CourseForm;
