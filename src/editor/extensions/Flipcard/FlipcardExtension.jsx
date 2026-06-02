import { NodeViewWrapper } from '@tiptap/react'
import React, { useState, useRef, useEffect } from 'react'
import { RotateCw, Edit, AlignLeft, AlignCenter, AlignRight, Palette, Maximize2, Minimize2, Square } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useEditorProvider } from '../../../contexts/EditorContext'

const FlipcardExtension = (props) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [question, setQuestion] = useState(props.node.attrs.question)
  const [answer, setAnswer] = useState(props.node.attrs.answer)
  const [color, setColor] = useState(props.node.attrs.color || 'blue')
  const [alignment, setAlignment] = useState(props.node.attrs.alignment || 'center')
  const [size, setSize] = useState(props.node.attrs.size || 'medium')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [isEditingAnswer, setIsEditingAnswer] = useState(false)
  const colorPickerRef = useRef(null)
  const questionInputRef = useRef(null)
  const answerInputRef = useRef(null)
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) setShowColorPicker(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFlip = () => { if (!isEditingQuestion && !isEditingAnswer) setIsFlipped(!isFlipped) }
  const handleQuestionChange = (e) => { setQuestion(e.target.value); props.updateAttributes({ question: e.target.value }) }
  const handleAnswerChange = (e) => { setAnswer(e.target.value); props.updateAttributes({ answer: e.target.value }) }
  const handleAlignmentChange = (newAlignment) => { setAlignment(newAlignment); props.updateAttributes({ alignment: newAlignment }) }
  const handleColorSelect = (selectedColor) => { setColor(selectedColor); setShowColorPicker(false); props.updateAttributes({ color: selectedColor }) }
  const handleSizeChange = (newSize) => { setSize(newSize); props.updateAttributes({ size: newSize }) }

  const getAlignmentClass = () => ({ left: 'justify-start', center: 'justify-center', right: 'justify-end' }[alignment] || 'justify-center')
  const getSizeClass = () => ({ small: 'w-64 h-36', medium: 'w-80 h-48', large: 'w-96 h-60' }[size] || 'w-80 h-48')
  const getFontSizeClass = () => ({ small: 'text-sm', medium: 'text-lg', large: 'text-xl' }[size] || 'text-lg')
  const getIconSize = () => ({ small: 16, medium: 20, large: 24 }[size] || 20)

  const getCardColor = (c, isBack = false) => {
    const base = {
      sky: isBack ? 'bg-sky-600 border-sky-700' : 'bg-sky-500 border-sky-600',
      green: isBack ? 'bg-emerald-600 border-emerald-700' : 'bg-emerald-500 border-emerald-600',
      yellow: isBack ? 'bg-amber-600 border-amber-700' : 'bg-amber-500 border-amber-600',
      red: isBack ? 'bg-red-600 border-red-700' : 'bg-red-500 border-red-600',
      purple: isBack ? 'bg-purple-600 border-purple-700' : 'bg-purple-500 border-purple-600',
      teal: isBack ? 'bg-teal-600 border-teal-700' : 'bg-teal-500 border-teal-600',
      amber: isBack ? 'bg-orange-600 border-orange-700' : 'bg-orange-500 border-orange-600',
      indigo: isBack ? 'bg-indigo-600 border-indigo-700' : 'bg-indigo-500 border-indigo-600',
      neutral: isBack ? 'bg-neutral-700 border-neutral-800' : 'bg-neutral-600 border-neutral-700',
      blue: isBack ? 'bg-blue-600 border-blue-700' : 'bg-blue-500 border-blue-600',
    }
    return base[c] || base.blue
  }

  const colors = ['sky', 'green', 'yellow', 'red', 'purple', 'teal', 'amber', 'indigo', 'neutral', 'blue']

  return (
    <NodeViewWrapper className={cn('flipcard-wrapper flex my-4', getAlignmentClass())}>
      <div className={cn('flipcard-container relative', getSizeClass())}>
        <div className={cn('flipcard-inner cursor-pointer', isFlipped && 'flipped')} onClick={handleFlip}>
          {/* Front */}
          <div className={cn('flipcard-front border-2 text-white p-6 nice-shadow flex flex-col items-center justify-center text-center rounded-xl', getCardColor(color, false))}>
            <div className="flex items-center justify-center mb-3 select-none pointer-events-none">
              <RotateCw size={getIconSize()} className="opacity-70" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              {isEditable && isEditingQuestion ? (
                <textarea ref={questionInputRef} value={question} onChange={handleQuestionChange} onBlur={() => setIsEditingQuestion(false)}
                  className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 p-2 rounded-lg w-full h-20 resize-none border-none outline-none text-center"
                  placeholder="Enter question" />
              ) : (
                <div className={cn('text-center font-medium leading-relaxed flex items-center justify-center select-none', getFontSizeClass())}>
                  <span className="select-none pointer-events-none">{question}</span>
                  {isEditable && (
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingQuestion(true); setTimeout(() => questionInputRef.current?.focus(), 0) }}
                      className="ml-2 opacity-60 hover:opacity-100 flex-shrink-0 pointer-events-auto">
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            {!isEditingQuestion && <div className="text-xs opacity-70 mt-3 select-none pointer-events-none">Click to flip</div>}
          </div>

          {/* Back */}
          <div className={cn('flipcard-back border-2 text-white p-6 nice-shadow flex flex-col items-center justify-center text-center rounded-xl', getCardColor(color, true))}>
            <div className="flex items-center justify-center mb-3 select-none pointer-events-none">
              <RotateCw size={getIconSize()} className="opacity-70 rotate-180" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              {isEditable && isEditingAnswer ? (
                <textarea ref={answerInputRef} value={answer} onChange={handleAnswerChange} onBlur={() => setIsEditingAnswer(false)}
                  className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 p-2 rounded-lg w-full h-20 resize-none border-none outline-none text-center"
                  placeholder="Enter answer" />
              ) : (
                <div className={cn('text-center font-medium leading-relaxed flex items-center justify-center select-none', getFontSizeClass())}>
                  <span className="select-none pointer-events-none">{answer}</span>
                  {isEditable && (
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingAnswer(true); setTimeout(() => answerInputRef.current?.focus(), 0) }}
                      className="ml-2 opacity-60 hover:opacity-100 flex-shrink-0 pointer-events-auto">
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            {!isEditingAnswer && <div className="text-xs opacity-70 mt-3">Click to flip back</div>}
          </div>
        </div>

        {isEditable && (
          <div className="flex mt-3 gap-1 justify-center opacity-60 hover:opacity-100 transition-opacity">
            {[['left', <AlignLeft size={12} />], ['center', <AlignCenter size={12} />], ['right', <AlignRight size={12} />]].map(([val, icon]) => (
              <button key={val} onClick={(e) => { e.stopPropagation(); handleAlignmentChange(val) }}
                className={cn('p-1.5 rounded-md transition-colors text-xs', alignment === val ? 'bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600')}
                title={`Align ${val}`}>{icon}</button>
            ))}
            <div className="w-px h-4 bg-neutral-300 self-center mx-1"></div>
            <button onClick={(e) => { e.stopPropagation(); handleSizeChange('small') }} className={cn('p-1.5 rounded-md transition-colors text-xs', size === 'small' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600')} title="Small"><Minimize2 size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleSizeChange('medium') }} className={cn('p-1.5 rounded-md transition-colors text-xs', size === 'medium' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600')} title="Medium"><Square size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleSizeChange('large') }} className={cn('p-1.5 rounded-md transition-colors text-xs', size === 'large' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600')} title="Large"><Maximize2 size={12} /></button>
            <div className="w-px h-4 bg-neutral-300 self-center mx-1"></div>
            <button onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker) }} className="p-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-600 rounded-md transition-colors text-xs" title="Change color"><Palette size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped) }} className="p-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-600 rounded-md transition-colors text-xs" title="Preview flip"><RotateCw size={12} /></button>
          </div>
        )}

        {isEditable && showColorPicker && (
          <div ref={colorPickerRef} className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-3 bg-white rounded-lg nice-shadow z-10 border border-neutral-200">
            <div className="flex flex-wrap gap-2 max-w-xs">
              {colors.map((c) => (
                <button key={c} className={cn('w-8 h-8 rounded-full border-2 border-white hover:scale-110 transform transition-transform', getCardColor(c), color === c && 'ring-2 ring-offset-2 ring-slate-400')}
                  onClick={() => handleColorSelect(c)} title={c.charAt(0).toUpperCase() + c.slice(1)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default FlipcardExtension
