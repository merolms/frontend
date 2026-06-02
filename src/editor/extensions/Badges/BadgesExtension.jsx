import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React, { useState, useRef, useEffect, lazy, Suspense } from 'react'
const Picker = lazy(() => import('@emoji-mart/react'))
import { ChevronDown, ChevronRight, Palette } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useEditorProvider } from '../../../contexts/EditorContext'

const BadgesExtension = (props) => {
  const [color, setColor] = useState(props.node.attrs.color)
  const [emoji, setEmoji] = useState(props.node.attrs.emoji)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showPredefinedCallouts, setShowPredefinedCallouts] = useState(false)
  const pickerRef = useRef(null)
  const colorPickerRef = useRef(null)
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable

  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((pickerRef.current && !pickerRef.current.contains(event.target)) ||
          (colorPickerRef.current && !colorPickerRef.current.contains(event.target))) {
        setShowEmojiPicker(false)
        setShowColorPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEmojiSelect = (e) => { setEmoji(e.native); setShowEmojiPicker(false); props.updateAttributes({ emoji: e.native }) }
  const handleColorSelect = (c) => { setColor(c); setShowColorPicker(false); props.updateAttributes({ color: c }) }

  const handlePredefinedBadgeSelect = (badge) => {
    setEmoji(badge.emoji)
    setColor(badge.color)
    props.updateAttributes({ emoji: badge.emoji, color: badge.color })
    const { editor } = props
    if (editor) {
      editor.commands.setTextSelection({ from: props.getPos() + 1, to: props.getPos() + props.node.nodeSize - 1 })
      editor.commands.insertContent(badge.content)
    }
    setShowPredefinedCallouts(false)
  }

  const colors = ['sky', 'green', 'yellow', 'red', 'purple', 'teal', 'amber', 'indigo', 'neutral']
  const predefinedBadges = [
    { emoji: '📝', color: 'sky', content: 'Key Concept' },
    { emoji: '💡', color: 'yellow', content: 'Example' },
    { emoji: '🔍', color: 'teal', content: 'Deep Dive' },
    { emoji: '⚠️', color: 'red', content: 'Important Note' },
    { emoji: '🧠', color: 'purple', content: 'Remember This' },
    { emoji: '🏋️', color: 'green', content: 'Exercise' },
    { emoji: '🎯', color: 'amber', content: 'Learning Objective' },
    { emoji: '📚', color: 'indigo', content: 'Further Reading' },
    { emoji: '💬', color: 'neutral', content: 'Discussion Topic' },
  ]

  const getBadgeColor = (c) => ({
    sky: 'bg-sky-400 text-sky-50', green: 'bg-green-400 text-green-50',
    yellow: 'bg-yellow-400 text-black', red: 'bg-red-500 text-red-50',
    purple: 'bg-purple-400 text-purple-50', teal: 'bg-teal-400 text-teal-900',
    amber: 'bg-amber-600 text-amber-100', indigo: 'bg-indigo-400 text-indigo-50',
    neutral: 'bg-neutral-800 text-white',
  }[c] || 'bg-sky-400 text-white')

  return (
    <NodeViewWrapper>
      <div className="flex space-x-2 items-center relative">
        <div className={twMerge('flex space-x-1 py-1.5 items-center w-fit rounded-full outline outline-2 outline-white/20 px-3.5 font-semibold nice-shadow text-sm my-2', getBadgeColor(color))}>
          <div className="flex items-center justify-center space-x-1">
            <span>{emoji}</span>
            {isEditable && <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}><ChevronDown size={14} /></button>}
          </div>
          <NodeViewContent contentEditable={isEditable} className="content capitalize text tracking-wide" />
          {isEditable && (
            <div className="flex items-center justify-center space-x-2 relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)}><Palette size={14} /></button>
              {showColorPicker && (
                <div ref={colorPickerRef} className="absolute left-full ml-2 p-2 bg-white rounded-full nice-shadow">
                  <div className="flex space-x-2">
                    {colors.map((c) => (
                      <button key={c} className={`w-8 h-8 rounded-full ${getBadgeColor(c)}`} onClick={() => handleColorSelect(c)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditable && (
          <button onClick={() => setShowPredefinedCallouts(!showPredefinedCallouts)} className="text-neutral-300 hover:text-neutral-400 transition-colors">
            <ChevronRight size={16} />
          </button>
        )}

        {isEditable && showPredefinedCallouts && (
          <div className="flex flex-wrap gap-2 absolute top-full mt-2 left-0 bg-white/90 backdrop-blur-md p-2 rounded-lg nice-shadow z-10">
            {predefinedBadges.map((badge, index) => (
              <button key={index} onClick={() => handlePredefinedBadgeSelect(badge)}
                className={`flex text-xs items-center px-3 py-1 rounded-xl space-x-2 ${getBadgeColor(badge.color)} font-bold hover:opacity-80 transition-all`}>
                <span>{badge.emoji}</span>
                <span className="capitalize">{badge.content}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isEditable && showEmojiPicker && (
        <div ref={pickerRef}>
          <Suspense fallback={<div className="p-4 text-gray-400 text-sm">Loading...</div>}>
            <Picker searchPosition="top" theme="light" previewPosition="none" maxFrequentRows={0} autoFocus={false} onEmojiSelect={handleEmojiSelect} />
          </Suspense>
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default BadgesExtension
