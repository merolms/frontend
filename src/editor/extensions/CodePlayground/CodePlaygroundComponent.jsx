import { NodeViewWrapper } from '@tiptap/react'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Play, Plus, Trash2, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight,
  Terminal, RotateCcw, Lightbulb, Code2, FlaskConical, FileText, Copy, ClipboardCheck,
  Eye, Settings2,
} from 'lucide-react'
import { useEditorProvider } from '../../../contexts/EditorContext'
import { PLAYGROUND_LANGUAGES, getLanguageById } from './languages'
import { v4 as uuidv4 } from 'uuid'
import CodeMirror from '@uiw/react-codemirror'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const cmStyles = { fontSize: '14px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }
const cmClassName = [
  '[&_.cm-editor]:!bg-[#1a1b26]', '[&_.cm-gutters]:!bg-[#1a1b26]',
  '[&_.cm-gutters]:!border-r-transparent', '[&_.cm-activeLineGutter]:!bg-[#24283b]',
  '[&_.cm-activeLine]:!bg-[#24283b]', '[&_.cm-editor]:!outline-none',
  '[&_.cm-focused]:!outline-none', '[&_.cm-scroller]:!overflow-auto', '[&_.cm-line]:!px-4',
].join(' ')

async function getLangExtension(codemirrorLang) {
  switch (codemirrorLang) {
    case 'python': { const { python } = await import('@codemirror/lang-python'); return python() }
    case 'javascript': { const { javascript } = await import('@codemirror/lang-javascript'); return javascript() }
    case 'java': { const { java } = await import('@codemirror/lang-java'); return java() }
    case 'cpp': { const { cpp } = await import('@codemirror/lang-cpp'); return cpp() }
    case 'rust': { const { rust } = await import('@codemirror/lang-rust'); return rust() }
    case 'go': { const { go } = await import('@codemirror/lang-go'); return go() }
    case 'php': { const { php } = await import('@codemirror/lang-php'); return php() }
    case 'sql': { const { sql } = await import('@codemirror/lang-sql'); return sql() }
    default: { const { javascript } = await import('@codemirror/lang-javascript'); return javascript() }
  }
}

function CodePlaygroundComponent(props) {
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable

  const [code, setCode] = useState(props.node.attrs.starterCode || '# Write your code here\n')
  const [description, setDescription] = useState(props.node.attrs.description || '')
  const [difficulty, setDifficulty] = useState(props.node.attrs.difficulty || 'medium')
  const [languageId, setLanguageId] = useState(props.node.attrs.languageId || 71)
  const [testCases, setTestCases] = useState(props.node.attrs.testCases || [])
  const [hints, setHints] = useState(props.node.attrs.hints || [])
  const [activeTab, setActiveTab] = useState('code')
  const [langExtensions, setLangExtensions] = useState([])
  const [theme, setTheme] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  const currentLang = getLanguageById(languageId) || PLAYGROUND_LANGUAGES[0]

  useEffect(() => {
    getLangExtension(currentLang.codemirrorLang).then(ext => setLangExtensions([ext]))
    import('@uiw/codemirror-theme-tokyo-night').then(m => setTheme(() => m.tokyoNight))
  }, [currentLang.codemirrorLang])

  const saveAttrs = useCallback((updates) => {
    props.updateAttributes(updates)
  }, [props])

  const handleLangChange = (id) => {
    const lang = getLanguageById(Number(id))
    if (!lang) return
    setLanguageId(lang.id)
    saveAttrs({ languageId: lang.id, languageName: lang.name })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const addTestCase = () => {
    const updated = [...testCases, { id: uuidv4(), input: '', expectedOutput: '', description: '' }]
    setTestCases(updated)
    saveAttrs({ testCases: updated })
  }

  const removeTestCase = (id) => {
    const updated = testCases.filter(tc => tc.id !== id)
    setTestCases(updated)
    saveAttrs({ testCases: updated })
  }

  const updateTestCase = (id, field, value) => {
    const updated = testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc)
    setTestCases(updated)
    saveAttrs({ testCases: updated })
  }

  const addHint = () => {
    const updated = [...hints, '']
    setHints(updated)
    saveAttrs({ hints: updated })
  }

  const removeHint = (idx) => {
    const updated = hints.filter((_, i) => i !== idx)
    setHints(updated)
    saveAttrs({ hints: updated })
  }

  const updateHint = (idx, value) => {
    const updated = hints.map((h, i) => i === idx ? value : h)
    setHints(updated)
    saveAttrs({ hints: updated })
  }

  const TABS = [
    { id: 'code', label: 'Code', icon: <Code2 size={14} /> },
    { id: 'description', label: 'Description', icon: <FileText size={14} /> },
    { id: 'tests', label: `Tests (${testCases.length})`, icon: <FlaskConical size={14} /> },
    { id: 'hints', label: `Hints (${hints.length})`, icon: <Lightbulb size={14} /> },
  ]

  // View mode
  if (!isEditable) {
    return (
      <NodeViewWrapper className="block-code w-full">
        <div className="rounded-xl overflow-hidden bg-[#1a1b26] nice-shadow">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#16161e] border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-white/40" />
              <span className="text-xs font-medium text-white/40">{currentLang.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {difficulty && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  difficulty === 'easy' ? 'bg-emerald-900/50 text-emerald-400' :
                  difficulty === 'hard' ? 'bg-red-900/50 text-red-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>{difficulty}</span>
              )}
              <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors">
                {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="px-4 py-3 border-b border-white/5 text-white/70 text-sm prose prose-invert max-w-none prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
            </div>
          )}

          {/* Editor */}
          <CodeMirror
            value={code}
            onChange={(val) => setCode(val)}
            extensions={langExtensions}
            theme={theme || undefined}
            style={cmStyles}
            className={cmClassName}
            basicSetup={{ lineNumbers: true, foldGutter: false }}
          />

          {/* Notice */}
          <div className="px-4 py-3 bg-[#16161e] border-t border-white/5 flex items-center gap-2 text-white/30 text-xs">
            <Terminal size={12} />
            <span>Code execution requires a backend connection. Standalone mode — edit only.</span>
          </div>

          {/* Hints */}
          {hints.length > 0 && (
            <div className="px-4 py-3 bg-[#16161e] border-t border-white/5">
              <button onClick={() => { setShowHint(!showHint); setHintIndex(0) }} className="flex items-center gap-2 text-yellow-400/70 hover:text-yellow-400 text-xs transition-colors">
                <Lightbulb size={14} />{showHint ? 'Hide hint' : `Show hint (${hints.length} available)`}
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-yellow-200/80 text-sm">
                  <p>{hints[hintIndex]}</p>
                  {hints.length > 1 && (
                    <div className="flex items-center gap-2 mt-2">
                      <button disabled={hintIndex === 0} onClick={() => setHintIndex(i => i - 1)} className="text-xs text-yellow-400/60 disabled:opacity-30">← Prev</button>
                      <span className="text-xs text-yellow-400/40">{hintIndex + 1}/{hints.length}</span>
                      <button disabled={hintIndex >= hints.length - 1} onClick={() => setHintIndex(i => i + 1)} className="text-xs text-yellow-400/60 disabled:opacity-30">Next →</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </NodeViewWrapper>
    )
  }

  // Edit mode
  return (
    <NodeViewWrapper className="block-code w-full">
      <div className="rounded-xl overflow-hidden bg-[#1a1b26] nice-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#16161e] border-b border-white/5">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-white/40" />
            <select value={languageId} onChange={(e) => handleLangChange(e.target.value)}
              className="bg-transparent text-xs text-white/60 outline-none border border-white/10 rounded px-2 py-1 hover:border-white/20 transition-colors">
              {PLAYGROUND_LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-[#1a1b26]">{l.name}</option>)}
            </select>
            <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); saveAttrs({ difficulty: e.target.value }) }}
              className="bg-transparent text-xs outline-none border border-white/10 rounded px-2 py-1 hover:border-white/20 transition-colors text-white/60">
              <option value="easy" className="bg-[#1a1b26]">Easy</option>
              <option value="medium" className="bg-[#1a1b26]">Medium</option>
              <option value="hard" className="bg-[#1a1b26]">Hard</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setCode(currentLang.defaultCode); saveAttrs({ starterCode: currentLang.defaultCode }) }}
              className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white/60 transition-colors" title="Reset to default">
              <RotateCcw size={14} />
            </button>
            <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors">
              {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-[#16161e]">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/60'
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'code' && (
          <CodeMirror
            value={code}
            onChange={(val) => { setCode(val); saveAttrs({ starterCode: val }) }}
            extensions={langExtensions}
            theme={theme || undefined}
            style={cmStyles}
            className={cmClassName}
            basicSetup={{ lineNumbers: true, foldGutter: true }}
          />
        )}

        {activeTab === 'description' && (
          <div className="p-4">
            <label className="block text-xs text-white/40 mb-2">Problem description (Markdown supported)</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); saveAttrs({ description: e.target.value }) }}
              placeholder="Describe the coding challenge..."
              rows={8}
              className="w-full bg-[#16161e] text-white/80 text-sm border border-white/10 rounded-lg p-3 resize-none outline-none focus:border-white/20 font-mono"
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="p-4 space-y-3">
            {testCases.map((tc, i) => (
              <div key={tc.id} className="bg-[#16161e] border border-white/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">Test case {i + 1}</span>
                  <button onClick={() => removeTestCase(tc.id)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/30 block mb-1">Input</label>
                    <textarea value={tc.input} onChange={(e) => updateTestCase(tc.id, 'input', e.target.value)}
                      rows={2} className="w-full bg-[#1a1b26] text-white/70 text-xs border border-white/10 rounded p-2 resize-none outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 block mb-1">Expected Output</label>
                    <textarea value={tc.expectedOutput} onChange={(e) => updateTestCase(tc.id, 'expectedOutput', e.target.value)}
                      rows={2} className="w-full bg-[#1a1b26] text-white/70 text-xs border border-white/10 rounded p-2 resize-none outline-none font-mono" />
                  </div>
                </div>
                <input value={tc.description} onChange={(e) => updateTestCase(tc.id, 'description', e.target.value)}
                  placeholder="Test description (optional)" className="w-full bg-[#1a1b26] text-white/50 text-xs border border-white/10 rounded p-2 outline-none" />
              </div>
            ))}
            <button onClick={addTestCase} className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors">
              <Plus size={14} />Add test case
            </button>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="p-4 space-y-3">
            {hints.map((hint, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-5 h-5 rounded bg-yellow-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs text-yellow-400 font-bold">{i + 1}</span>
                </div>
                <textarea value={hint} onChange={(e) => updateHint(i, e.target.value)}
                  rows={2} placeholder={`Hint ${i + 1}...`}
                  className="flex-1 bg-[#16161e] text-white/70 text-sm border border-white/10 rounded-lg p-2 resize-none outline-none focus:border-yellow-700/40" />
                <button onClick={() => removeHint(i)} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0 mt-1"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={addHint} className="flex items-center gap-2 text-xs text-white/40 hover:text-yellow-400 transition-colors">
              <Plus size={14} />Add hint
            </button>
          </div>
        )}

        <div className="px-4 py-2 bg-[#16161e] border-t border-white/5 text-white/20 text-xs">
          Code execution requires a backend — standalone mode.
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default CodePlaygroundComponent
