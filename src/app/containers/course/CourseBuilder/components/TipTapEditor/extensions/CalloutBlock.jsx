import React from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';

const TYPES = {
  info:    { label: 'Info',    emoji: 'ℹ️',  bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  warning: { label: 'Warning', emoji: '⚠️',  bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
  tip:     { label: 'Tip',     emoji: '💡', bg: '#f0fdf4', border: '#bbf7d0', color: '#14532d' },
  success: { label: 'Success', emoji: '✅', bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
  error:   { label: 'Error',   emoji: '❌', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
};

// ─── TipTap node definition ──────────────────────────────────
export const CalloutBlock = Node.create({
  name: 'callout',
  group: 'block',
  draggable: true,
  content: 'inline*',

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: el => el.getAttribute('data-type') || 'info',
        renderHTML: attrs => ({ 'data-type': attrs.type }),
      },
    };
  },

  parseHTML()  { return [{ tag: 'callout-block' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['callout-block', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBlockComponent);
  },
});

// ─── React component ─────────────────────────────────────────
function CalloutBlockComponent({ node, updateAttributes }) {
  const type = node.attrs.type || 'info';
  const cfg  = TYPES[type] || TYPES.info;

  return (
    <NodeViewWrapper>
      <div className="lh-callout" style={{ background: cfg.bg, borderColor: cfg.border }}>
        <div className="lh-callout-side">
          <select
            className="lh-callout-select"
            value={type}
            onChange={e => updateAttributes({ type: e.target.value })}
          >
            {Object.entries(TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
        </div>
        <NodeViewContent className="lh-callout-content" style={{ color: cfg.color }} />
      </div>
    </NodeViewWrapper>
  );
}
