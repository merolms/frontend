import React, { useState } from 'react';
import { Form, Input, Button, Icon } from 'semantic-ui-react';

const PdfEditor = ({ content = {}, onChange }) => {
  const [url, setUrl] = useState(content.pdfUrl || '');
  const [title, setTitle] = useState(content.title || '');
  const [pages, setPages] = useState(content.pages || '');

  const handleSave = () => {
    onChange({
      pdfUrl: url,
      title,
      pages: pages || undefined,
    });
  };

  return (
    <Form>
      <Form.Field required>
        <label>PDF URL</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://example.com/document.pdf'
          icon='file pdf'
          iconPosition='left'
        />
        <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
          Enter the direct URL to a PDF file
        </p>
      </Form.Field>

      {url && url.match(/\.pdf(\?.*)?$/i) && (
        <Form.Field>
          <label>Preview</label>
          <div style={{
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid #e8e8e8',
            height: 250,
          }}>
            <iframe
              src={url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title='PDF preview'
            />
          </div>
        </Form.Field>
      )}

      <Form.Group widths='equal'>
        <Form.Field>
          <label>Document Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g., Chapter 3 Workbook'
          />
        </Form.Field>
        <Form.Field>
          <label>Pages</label>
          <Input
            type='number'
            min={1}
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder='e.g., 24'
          />
        </Form.Field>
      </Form.Group>

      {/* Upload placeholder */}
      <div className='media-upload-zone'>
        <Icon name='cloud upload' size='large' color='grey' />
        <p style={{ margin: '8px 0 4px' }}>Or upload a PDF file</p>
        <p style={{ fontSize: 11, color: '#aaa' }}>PDF — max 100MB</p>
        <Button size='tiny' disabled style={{ marginTop: 8 }}>
          Choose File
        </Button>
        <p style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
          File upload coming soon — use URL for now
        </p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button primary onClick={handleSave}>
          <Icon name='check' /> Apply PDF
        </Button>
      </div>
    </Form>
  );
};

export default PdfEditor;
