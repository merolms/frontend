import React, { useState } from 'react';
import { Form, Input, Button, Icon, TextArea } from 'semantic-ui-react';

const AudioEditor = ({ content = {}, onChange }) => {
  const [url, setUrl] = useState(content.audioUrl || '');
  const [transcript, setTranscript] = useState(content.transcript || '');
  const [duration, setDuration] = useState(content.duration || '');

  const handleSave = () => {
    onChange({
      audioUrl: url,
      transcript,
      duration: duration || undefined,
    });
  };

  return (
    <Form>
      <Form.Field required>
        <label>Audio URL</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://example.com/audio.mp3'
          icon='volume up'
          iconPosition='left'
        />
        <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
          Supports MP3, WAV, OGG, or M4A file URLs
        </p>
      </Form.Field>

      {url && (
        <Form.Field>
          <label>Preview</label>
          <div style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: 16,
            border: '1px solid #e8e8e8',
          }}>
            <audio controls src={url} style={{ width: '100%' }}>
              Your browser does not support audio playback.
            </audio>
          </div>
        </Form.Field>
      )}

      <Form.Group widths='equal'>
        <Form.Field>
          <label>Duration</label>
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder='e.g., 8:45'
          />
        </Form.Field>
        <Form.Field>
          <label>&nbsp;</label>
          <div style={{ paddingTop: 8 }}>
            <Icon name='info circle' color='blue' style={{ marginRight: 4 }} />
            <span style={{ fontSize: 12, color: '#888' }}>Auto-detected from file when possible</span>
          </div>
        </Form.Field>
      </Form.Group>

      <Form.Field>
        <label>Transcript / Show Notes</label>
        <TextArea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder='Enter audio transcript or show notes...'
          style={{ minHeight: 80, fontFamily: 'inherit', fontSize: 13 }}
        />
      </Form.Field>

      {/* Upload placeholder */}
      <div className='media-upload-zone'>
        <Icon name='cloud upload' size='large' color='grey' />
        <p style={{ margin: '8px 0 4px' }}>Or upload an audio file</p>
        <p style={{ fontSize: 11, color: '#aaa' }}>MP3, WAV, OGG, M4A — max 500MB</p>
        <Button size='tiny' disabled style={{ marginTop: 8 }}>
          Choose File
        </Button>
        <p style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
          File upload coming soon — use URL for now
        </p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button primary onClick={handleSave}>
          <Icon name='check' /> Apply Audio
        </Button>
      </div>
    </Form>
  );
};

export default AudioEditor;
