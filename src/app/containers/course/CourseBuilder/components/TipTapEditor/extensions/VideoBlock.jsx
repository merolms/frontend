import React, { useRef, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { uploadBlockMedia } from '@/app/services/blockService';

// ─── TipTap node definition ──────────────────────────────────
export const VideoBlock = Node.create({
  name: 'blockVideo',
  group: 'block',
  draggable: true,
  atom: true,

  addOptions() {
    return { lessonId: null };
  },

  addAttributes() {
    return {
      url:    { default: null },
      nodeId: { default: () => 'vid_' + Math.random().toString(36).slice(2) },
    };
  },

  parseHTML()  { return [{ tag: 'block-video' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['block-video', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoBlockComponent);
  },
});

// ─── React component ─────────────────────────────────────────
function VideoBlockComponent({ node, updateAttributes, extension }) {
  const { url, nodeId } = node.attrs;
  const { lessonId }    = extension.options;

  const inputRef          = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return;
    setLoading(true);
    setError(null);
    try {
      const uploadedUrl = await uploadBlockMedia(lessonId, nodeId, file);
      updateAttributes({ url: uploadedUrl });
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <NodeViewWrapper>
      <div className="lh-block lh-block--video">
        <div className="lh-block-header">
          <span className="lh-block-label">🎬 Video</span>
          {url && (
            <button className="lh-action-btn" onClick={() => inputRef.current?.click()}>Replace</button>
          )}
        </div>

        {!url ? (
          <div
            className={`lh-upload-zone${loading ? ' lh-upload-zone--loading' : ''}`}
            onClick={() => !loading && inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <input
              ref={inputRef} type="file" accept="video/*"
              className="lh-file-hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
            {loading
              ? <span className="lh-spinner" />
              : <>
                  <span className="lh-upload-icon">▶</span>
                  <span className="lh-upload-text">Click or drag a video here</span>
                  <span className="lh-upload-hint">MP4 · WebM · MOV</span>
                </>
            }
          </div>
        ) : (
          <div className="lh-video-wrap">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={url} controls className="lh-video" />
            <div className="lh-video-actions">
              <button className="lh-action-btn" onClick={() => inputRef.current?.click()}>Replace</button>
              <button className="lh-action-btn lh-action-btn--danger" onClick={() => updateAttributes({ url: null })}>Remove</button>
            </div>
            <input
              ref={inputRef} type="file" accept="video/*"
              className="lh-file-hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        )}

        {error && <p className="lh-block-error">{error}</p>}
      </div>
    </NodeViewWrapper>
  );
}
