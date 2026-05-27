import React, { useState } from 'react';
import { Form, Input, Button, Icon, Message, Image, Label, TextArea } from 'semantic-ui-react';

const VideoEditor = ({ content = {}, onChange }) => {
  const [url, setUrl] = useState(content.videoUrl || '');
  const [transcript, setTranscript] = useState(content.transcript || '');
  const [thumbnail, setThumbnail] = useState(content.thumbnail || '');
  const [duration, setDuration] = useState(content.duration || '');

  // Sync from parent when content prop changes (e.g., switching lessons)
  React.useEffect(() => {
    setUrl(content.videoUrl || '');
    setTranscript(content.transcript || '');
    setThumbnail(content.thumbnail || '');
    setDuration(content.duration || '');
  }, [content.videoUrl, content.transcript, content.thumbnail, content.duration]);

  const emit = () => {
    onChange({
      videoUrl: url,
      transcript,
      thumbnail,
      duration: duration || undefined,
    });
  };

  // Detect video platform for embed
  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    // YouTube
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return videoUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <Form>
      <Form.Field required>
        <label>Video URL</label>
        <Input
          value={url}
          onChange={(e) => { setUrl(e.target.value); emit(); }}
          placeholder='https://youtube.com/watch?v=... or direct video URL'
          icon='video'
          iconPosition='left'
        />
        <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
          Supports YouTube, Vimeo, or direct video file URLs (MP4, WebM)
        </p>
      </Form.Field>

      {url && (
        <Form.Field>
          <label>Preview</label>
          <div style={{
            background: '#1a1a1a',
            borderRadius: 8,
            overflow: 'hidden',
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {embedUrl && embedUrl !== url ? (
              <iframe
                src={embedUrl}
                style={{ width: '100%', height: 200, border: 'none' }}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                title='Video preview'
              />
            ) : url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
              <video src={url} controls style={{ width: '100%', maxHeight: 200 }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
                <Icon name='video' size='huge' />
                <p style={{ marginTop: 8 }}>Video preview not available</p>
                <p style={{ fontSize: 11 }}>Enter a valid URL or upload a file</p>
              </div>
            )}
          </div>
        </Form.Field>
      )}

      <Form.Group widths='equal'>
        <Form.Field>
          <label>Thumbnail URL</label>
          <Input
            value={thumbnail}
            onChange={(e) => { setThumbnail(e.target.value); emit(); }}
            placeholder='https://example.com/thumb.jpg'
          />
        </Form.Field>
        <Form.Field>
          <label>Duration</label>
          <Input
            value={duration}
            onChange={(e) => { setDuration(e.target.value); emit(); }}
            placeholder='e.g., 12:34'
          />
        </Form.Field>
      </Form.Group>

      <Form.Field>
        <label>Transcript / Captions</label>
        <TextArea
          value={transcript}
          onChange={(e) => { setTranscript(e.target.value); emit(); }}
          placeholder='Enter video transcript or paste captions...'
          style={{ minHeight: 80, fontFamily: 'inherit', fontSize: 13 }}
        />
        <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
          Helps with accessibility and search
        </p>
      </Form.Field>

      {/* Upload placeholder */}
      <div className='media-upload-zone'>
        <Icon name='cloud upload' size='large' color='grey' />
        <p style={{ margin: '8px 0 4px' }}>Or upload a video file</p>
        <p style={{ fontSize: 11, color: '#aaa' }}>MP4, WebM, MOV — max 2GB</p>
        <Button size='tiny' disabled style={{ marginTop: 8 }}>
          Choose File
        </Button>
        <p style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
          File upload coming soon — use URL for now
        </p>
      </div>
    </Form>
  );
};

export default VideoEditor;
