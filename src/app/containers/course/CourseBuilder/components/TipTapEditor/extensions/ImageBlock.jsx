import React, { useRef, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { uploadBlockMedia } from '@/app/services/blockService';

// ─── TipTap node definition ──────────────────────────────────
export const ImageBlock = Node.create({
  name: 'blockImage',
  group: 'block',
  draggable: true,
  atom: true,

  addOptions() {
    return { lessonId: null };
  },

  addAttributes() {
    return {
      url:       { default: null },
      alt:       { default: '' },
      alignment: { default: 'center' },
      nodeId:    { default: () => 'img_' + Math.random().toString(36).slice(2) },
    };
  },

  parseHTML()  { return [{ tag: 'block-image' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['block-image', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockComponent);
  },
});

// ─── React component ─────────────────────────────────────────
function ImageBlockComponent({ node, updateAttributes, extension }) {
  const { url, alt, alignment, nodeId } = node.attrs;
  const { lessonId } = extension.options;

  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
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
      <div className="lh-block lh-block--image">
        <div className="lh-block-header">
          <span className="lh-block-label">📷 Image</span>
          {url && (
            <div className="lh-align-btns">
              {['left', 'center', 'right'].map(a => (
                <button
                  key={a}
                  className={`lh-align-btn${alignment === a ? ' active' : ''}`}
                  onClick={() => updateAttributes({ alignment: a })}
                  title={`Align ${a}`}
                >
                  {a === 'left' ? '⬛' : a === 'center' ? '⬛' : '⬛'}
                </button>
              ))}
            </div>
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
              ref={inputRef} type="file" accept="image/*"
              className="lh-file-hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
            {loading
              ? <span className="lh-spinner" />
              : <>
                  <span className="lh-upload-icon">⬆</span>
                  <span className="lh-upload-text">Click or drag an image here</span>
                  <span className="lh-upload-hint">JPG · PNG · WebP · GIF</span>
                </>
            }
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: justifyMap[alignment] }}>
            <div className="lh-image-wrap">
              <img src={url} alt={alt} className="lh-image" />
              <div className="lh-image-toolbar">
                <input
                  className="lh-alt-input"
                  placeholder="Alt text…"
                  value={alt}
                  onChange={e => updateAttributes({ alt: e.target.value })}
                />
                <button className="lh-action-btn" onClick={() => inputRef.current?.click()}>Replace</button>
                <button className="lh-action-btn lh-action-btn--danger" onClick={() => updateAttributes({ url: null })}>Remove</button>
              </div>
              <input
                ref={inputRef} type="file" accept="image/*"
                className="lh-file-hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          </div>
        )}

        {error && <p className="lh-block-error">{error}</p>}
      </div>
    </NodeViewWrapper>
  );
}
