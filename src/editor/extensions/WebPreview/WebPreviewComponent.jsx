import React, { useState, useEffect, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Edit2, Save, X, AlignLeft, AlignCenter, AlignRight, Trash } from 'lucide-react'
import { useEditorProvider } from '../../../contexts/EditorContext'
import Modal from '../../../components/ui/Modal'

const ALIGNMENTS = [
  { value: 'left', label: <AlignLeft size={16} /> },
  { value: 'center', label: <AlignCenter size={16} /> },
  { value: 'right', label: <AlignRight size={16} /> },
]

function WebPreviewComponent({ node, updateAttributes, deleteNode }) {
  const [inputUrl, setInputUrl] = useState(node.attrs.url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(!node.attrs.url)
  const [modalOpen, setModalOpen] = useState(!node.attrs.url)
  const [popupOpen, setPopupOpen] = useState(false)
  const [buttonLabel, setButtonLabel] = useState(node.attrs.buttonLabel || '')
  const [showButton, setShowButton] = useState(node.attrs.showButton !== false)
  const [openInPopup, setOpenInPopup] = useState(node.attrs.openInPopup || false)
  const inputRef = useRef(null)
  const editorContext = useEditorProvider()
  const isEditable = editorContext?.isEditable ?? true

  const previewData = {
    title: node.attrs.title,
    description: node.attrs.description,
    og_image: node.attrs.og_image,
    favicon: node.attrs.favicon,
    url: node.attrs.url,
  }

  const alignment = node.attrs.alignment || 'left'
  const hasPreview = !!previewData.title

  useEffect(() => {
    setButtonLabel(node.attrs.buttonLabel || 'Visit Site')
    setShowButton(!!node.attrs.showButton)
    setOpenInPopup(!!node.attrs.openInPopup)
  }, [node.attrs.buttonLabel, node.attrs.showButton, node.attrs.openInPopup])

  useEffect(() => {
    if (!node.attrs.url) { setEditing(true); setModalOpen(true) }
  }, [node.attrs.url])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  // Standalone: no backend, so we just store the URL and show a basic card
  const handleSaveEdit = () => {
    if (inputUrl.trim()) {
      updateAttributes({ url: inputUrl.trim(), title: inputUrl.trim(), description: '', og_image: null, favicon: null, buttonLabel, showButton, openInPopup })
    } else {
      updateAttributes({ buttonLabel, showButton, openInPopup })
    }
    setEditing(false)
    setModalOpen(false)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setInputUrl(node.attrs.url || '')
    setError(null)
    setModalOpen(false)
  }

  const handleDelete = () => {
    if (typeof deleteNode === 'function') {
      deleteNode()
    } else {
      updateAttributes({ url: null, title: null, description: null, og_image: null, favicon: null })
    }
  }

  const handleAlignmentChange = (value) => updateAttributes({ alignment: value })

  let alignClass = 'justify-start'
  if (alignment === 'center') alignClass = 'justify-center'
  else if (alignment === 'right') alignClass = 'justify-end'

  return (
    <NodeViewWrapper className="web-preview-block relative">
      <Modal
        isDialogOpen={popupOpen}
        onOpenChange={setPopupOpen}
        dialogTitle={previewData.title || 'Website Preview'}
        minWidth="xl"
        minHeight="xl"
        dialogContent={
          <iframe src={previewData.url} title="Embedded preview" className="w-full h-full border-0 bg-white" style={{ minHeight: 400 }} allowFullScreen />
        }
      />
      <div className={`flex w-full ${alignClass}`}>
        <div className="bg-white nice-shadow rounded-xl max-w-[420px] min-w-[260px] my-2 px-6 pt-6 pb-4 relative">
          {isEditable && !editing && (
            <div className="flex flex-col gap-2 absolute -top-3 -right-3 z-20">
              <button className="flex items-center justify-center bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-md rounded-md p-1.5 hover:bg-yellow-100" onClick={() => { setEditing(true); setInputUrl(node.attrs.url || ''); setModalOpen(true) }} type="button">
                <Edit2 size={16} />
              </button>
              <button className="flex items-center justify-center bg-red-50 text-red-700 border border-red-200 shadow-md rounded-md p-1.5 hover:bg-red-100" onClick={handleDelete} type="button">
                <Trash size={16} />
              </button>
            </div>
          )}

          <Modal
            isDialogOpen={modalOpen}
            onOpenChange={(open) => { setModalOpen(open); if (!open) handleCancelEdit() }}
            dialogTitle="Edit Web Preview Card"
            dialogContent={
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveEdit() }}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Website URL</label>
                  <input
                    ref={inputRef}
                    id="web-url-input"
                    type="text"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg outline-none focus:border-neutral-400 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Button Options</label>
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={showButton} onChange={(e) => setShowButton(e.target.checked)} />
                      Show button
                    </label>
                    {showButton && (
                      <>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={openInPopup} onChange={(e) => setOpenInPopup(e.target.checked)} />
                          Open in popup
                        </label>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-neutral-600">Button label</label>
                          <input type="text" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} placeholder="Visit Site" className="w-36 px-2 py-1 border border-neutral-200 rounded text-sm outline-none focus:border-neutral-400" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Alignment</label>
                  <div className="flex gap-2 pt-1">
                    {ALIGNMENTS.map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => handleAlignmentChange(opt.value)}
                        className={`px-2 py-1 rounded-full border text-sm transition-colors ${alignment === opt.value ? 'bg-black text-white border-black' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <div className="text-red-600 text-xs">{error}</div>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleCancelEdit} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-1">
                    <X size={14} /> Cancel
                  </button>
                  <button type="submit" disabled={loading || !inputUrl} className="px-3 py-2 text-sm bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 disabled:opacity-50 flex items-center gap-1">
                    <Save size={14} /> Save
                  </button>
                </div>
              </form>
            }
          />

          {hasPreview && !editing && (
            <>
              <a href={previewData.url} target="_blank" rel="noopener noreferrer" className="no-underline" style={{ textDecoration: 'none' }}>
                {previewData.og_image && (
                  <div className="-mt-6 -mx-6 mb-0 rounded-t-xl overflow-hidden">
                    <img src={previewData.og_image} alt="preview" className="w-full h-40 object-cover block" />
                  </div>
                )}
                <div className="pt-4 pb-2">
                  <span className="font-semibold text-lg text-[#232323] block mb-1.5 leading-tight">{previewData.title}</span>
                  {previewData.description && (
                    <span className="block text-gray-700 text-sm mb-3 leading-snug">{previewData.description}</span>
                  )}
                </div>
              </a>
              <div className="flex items-center mt-0 pt-2 border-t border-gray-100">
                {previewData.favicon && <img src={previewData.favicon} alt="favicon" className="w-[18px] h-[18px] mr-2 rounded bg-gray-100" />}
                <span className="text-gray-500 text-xs truncate">{previewData.url}</span>
              </div>
              {showButton && previewData.url && (
                openInPopup ? (
                  <button type="button" className="block w-full mt-4 rounded-xl bg-black text-white py-2.5 px-4 text-center font-semibold text-[16px] hover:bg-gray-900 transition-all" onClick={() => setPopupOpen(true)}>
                    {buttonLabel || 'Visit Site'}
                  </button>
                ) : (
                  <a href={previewData.url} target="_blank" rel="noopener noreferrer" className="block w-full mt-4 rounded-xl bg-black text-white py-2.5 px-4 text-center font-semibold text-[16px] hover:bg-gray-900 transition-all" style={{ textDecoration: 'none', color: 'white' }}>
                    {buttonLabel || 'Visit Site'}
                  </a>
                )
              )}
              {isEditable && (
                <div className="flex flex-col items-center mt-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-1">Align:</span>
                    {ALIGNMENTS.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => handleAlignmentChange(opt.value)}
                        className={`flex items-center justify-center border p-1.5 rounded-full text-gray-600 transition-colors ${alignment === opt.value ? 'bg-gray-600 text-white border-gray-600' : 'bg-white border-gray-200 hover:bg-gray-100'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!hasPreview && !editing && (
            <div className="text-center py-4 text-neutral-400 text-sm">
              No preview available. <button onClick={() => { setEditing(true); setModalOpen(true) }} className="text-blue-500 underline">Edit URL</button>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default WebPreviewComponent
