import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Upload, Loader2, AlertCircle, Headphones } from 'lucide-react'
import { useEditorProvider } from '../../../contexts/EditorContext'

function AudioBlockComponent(props) {
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable
  const fileInputRef = React.useRef(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const dataUrl = props.node.attrs.dataUrl
  const fileName = props.node.attrs.fileName

  const handleFileRead = (file) => {
    setIsLoading(true)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      props.updateAttributes({ dataUrl: e.target.result, fileName: file.name })
      setIsLoading(false)
    }
    reader.onerror = () => { setError('Failed to read audio file'); setIsLoading(false) }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) handleFileRead(file)
  }

  const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'].includes(file.type)) {
      handleFileRead(file)
    }
  }

  if (!isEditable && !dataUrl) return null

  if (!isEditable && dataUrl) {
    return (
      <NodeViewWrapper className="block-audio w-full">
        <audio src={dataUrl} controls className="w-full" />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="block-audio w-full">
      <div className="bg-neutral-50 rounded-xl px-5 py-4 nice-shadow transition-all ease-linear">
        <div className="flex items-center gap-2 mb-3">
          <Headphones className="text-neutral-400" size={16} />
          <span className="uppercase tracking-widest text-xs font-bold text-neutral-400">Audio</span>
        </div>

        {dataUrl ? (
          <div>
            <audio src={dataUrl} controls className="w-full" />
            {fileName && <p className="text-xs text-neutral-500 mt-2">{fileName}</p>}
            {isEditable && (
              <button
                onClick={() => props.updateAttributes({ dataUrl: null, fileName: null })}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remove audio
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px]
              ${isDragging ? 'border-neutral-400 bg-neutral-100' : 'border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50'}`}
          >
            <input ref={fileInputRef} type="file" onChange={handleFileChange} accept=".mp3,.wav,.ogg" className="hidden" />
            {isLoading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" />
                <p className="text-sm text-neutral-600">Loading audio...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-7 h-7 mx-auto text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-700">Drop or browse to upload audio</p>
                  <p className="text-xs text-neutral-500 mt-1">MP3, WAV, OGG supported</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-lg p-3">
            <AlertCircle size={16} />{error}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default AudioBlockComponent
