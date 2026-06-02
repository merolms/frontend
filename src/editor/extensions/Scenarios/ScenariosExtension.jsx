import { NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { RotateCcw, ArrowRight, CheckCircle, GitBranch, RefreshCcw, Plus, Trash2, Save, Play } from 'lucide-react'
import { useEditorProvider } from '../../../contexts/EditorContext'

const ScenariosExtension = (props) => {
  const [title, setTitle] = useState(props.node.attrs.title)
  const [scenarios, setScenarios] = useState(props.node.attrs.scenarios)
  const [currentScenarioId, setCurrentScenarioId] = useState(props.node.attrs.currentScenarioId)
  const [isEditing, setIsEditing] = useState(false)
  const [scenarioComplete, setScenarioComplete] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewCurrentId, setPreviewCurrentId] = useState(props.node.attrs.currentScenarioId)
  const editorState = useEditorProvider()
  const isEditable = editorState?.isEditable ?? true

  const getCurrentScenario = (scenarioId = currentScenarioId) =>
    scenarios.find(s => s.id === scenarioId) || null

  const saveAll = (newTitle, newScenarios, newCurrentId) => {
    setTitle(newTitle)
    setScenarios(newScenarios)
    setCurrentScenarioId(newCurrentId)
    props.updateAttributes({ title: newTitle, scenarios: newScenarios, currentScenarioId: newCurrentId })
  }

  const handleOptionClick = (nextScenarioId) => {
    if (nextScenarioId) { setCurrentScenarioId(nextScenarioId); setScenarioComplete(false) }
    else setScenarioComplete(true)
  }

  const resetScenario = () => { setCurrentScenarioId(scenarios[0]?.id || '1'); setScenarioComplete(false) }
  const getOptionLetter = (index) => String.fromCharCode('A'.charCodeAt(0) + index)

  // Inline editor helpers
  const addScenario = () => {
    if (scenarios.length >= 40) return
    const newId = (Math.max(...scenarios.map(s => parseInt(s.id) || 0)) + 1).toString()
    const newScenario = { id: newId, text: 'New scenario text...', imageUrl: '', options: [{ id: `opt${Date.now()}`, text: 'Option 1', nextScenarioId: null }] }
    const updated = [...scenarios, newScenario]
    setScenarios(updated)
    props.updateAttributes({ scenarios: updated })
  }

  const deleteScenario = (scenarioId) => {
    if (scenarios.length <= 1) return
    const updated = scenarios.filter(s => s.id !== scenarioId).map(s => ({
      ...s, options: s.options.map(o => ({ ...o, nextScenarioId: o.nextScenarioId === scenarioId ? null : o.nextScenarioId }))
    }))
    setScenarios(updated)
    if (currentScenarioId === scenarioId) setCurrentScenarioId(updated[0]?.id || '1')
    props.updateAttributes({ scenarios: updated })
  }

  const updateScenario = (scenarioId, updates) => {
    const updated = scenarios.map(s => s.id === scenarioId ? { ...s, ...updates } : s)
    setScenarios(updated)
    props.updateAttributes({ scenarios: updated })
  }

  const addOption = (scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario || scenario.options.length >= 4) return
    updateScenario(scenarioId, { options: [...scenario.options, { id: `opt${Date.now()}`, text: 'New option', nextScenarioId: null }] })
  }

  const deleteOption = (scenarioId, optionId) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario || scenario.options.length <= 1) return
    updateScenario(scenarioId, { options: scenario.options.filter(o => o.id !== optionId) })
  }

  const updateOption = (scenarioId, optionId, updates) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario) return
    updateScenario(scenarioId, { options: scenario.options.map(o => o.id === optionId ? { ...o, ...updates } : o) })
  }

  return (
    <NodeViewWrapper className="block-scenarios">
      <div className="bg-neutral-50 rounded-xl px-5 py-4 nice-shadow transition-all ease-linear">
        {/* Header */}
        <div className="flex flex-wrap gap-2 items-center text-sm mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="text-neutral-400" size={16} />
            <span className="uppercase tracking-widest text-xs font-bold text-neutral-400">Interactive Scenario</span>
          </div>
          {scenarioComplete && !isEditable && (
            <div className="text-xs font-medium px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">Scenario Complete!</div>
          )}
          <div className="grow" />
          {isEditable ? (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1.5 bg-blue-600 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors outline-none">
                    <Play size={12} />{showPreview ? 'Edit' : 'Preview'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 bg-neutral-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors outline-none">
                    <Save size={12} />Done
                  </button>
                </>
              ) : (
                <button onClick={() => { setIsEditing(true); setShowPreview(false) }} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors outline-none">
                  Edit Scenarios
                </button>
              )}
            </div>
          ) : (
            <button onClick={resetScenario} className="p-1.5 rounded-md hover:bg-neutral-200 transition-colors" title="Reset scenario">
              <RefreshCcw className="text-neutral-500" size={15} />
            </button>
          )}
        </div>

        {/* Edit mode */}
        {isEditable && isEditing && !showPreview && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 nice-shadow">
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Title</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); props.updateAttributes({ title: e.target.value }) }}
                placeholder="Scenario Title" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-400" />
            </div>
            <div className="text-xs text-neutral-500 text-center">{scenarios.length}/40 scenarios</div>
            {scenarios.map((scenario, si) => (
              <div key={scenario.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-neutral-200 rounded flex items-center justify-center text-xs font-bold text-neutral-700">{si + 1}</span>
                    <span className="text-sm font-semibold text-neutral-800">Scenario {scenario.id}</span>
                    {scenario.id === currentScenarioId && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Start</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setCurrentScenarioId(scenario.id); props.updateAttributes({ currentScenarioId: scenario.id }) }}
                      className={`px-2 py-1 rounded text-xs font-medium ${scenario.id === currentScenarioId ? 'bg-emerald-500 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'}`}>
                      {scenario.id === currentScenarioId ? 'Start' : 'Set Start'}
                    </button>
                    <button onClick={() => deleteScenario(scenario.id)} disabled={scenarios.length <= 1} className="p-1.5 text-neutral-400 hover:text-red-500 rounded disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-600 block mb-1">Description</label>
                    <textarea value={scenario.text} onChange={(e) => updateScenario(scenario.id, { text: e.target.value })}
                      rows={2} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-neutral-400"
                      placeholder="What happens in this scenario..." />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-neutral-600">Options ({scenario.options.length}/4)</label>
                      <button onClick={() => addOption(scenario.id)} disabled={scenario.options.length >= 4}
                        className="flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs disabled:opacity-40">
                        <Plus size={12} />Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {scenario.options.map((option, oi) => (
                        <div key={option.id} className="flex items-start gap-2 bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                          <span className="w-5 h-5 bg-white border border-neutral-300 rounded flex items-center justify-center text-xs font-bold text-neutral-600 mt-0.5 flex-shrink-0">
                            {getOptionLetter(oi)}
                          </span>
                          <div className="flex-1 space-y-1">
                            <input type="text" value={option.text} onChange={(e) => updateOption(scenario.id, option.id, { text: e.target.value })}
                              className="w-full px-2 py-1.5 border border-neutral-200 rounded text-sm outline-none focus:border-neutral-400 bg-white"
                              placeholder="Option text..." />
                            <select value={option.nextScenarioId || ''} onChange={(e) => updateOption(scenario.id, option.id, { nextScenarioId: e.target.value || null })}
                              className="w-full px-2 py-1 border border-neutral-200 rounded text-xs outline-none focus:border-neutral-400 bg-white">
                              <option value="">End scenario</option>
                              {scenarios.map(s => <option key={s.id} value={s.id}>Scenario {s.id}</option>)}
                            </select>
                          </div>
                          <button onClick={() => deleteOption(scenario.id, option.id)} disabled={scenario.options.length <= 1}
                            className="p-1 text-neutral-400 hover:text-red-500 rounded disabled:opacity-30 flex-shrink-0">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addScenario} disabled={scenarios.length >= 40}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 text-sm transition-colors disabled:opacity-40">
              <Plus size={14} />Add Scenario
            </button>
          </div>
        )}

        {/* Preview mode (in edit) */}
        {isEditable && isEditing && showPreview && (() => {
          const previewScenario = scenarios.find(s => s.id === previewCurrentId) || null
          return previewCurrentId === 'end' ? (
            <div className="bg-white rounded-lg p-6 text-center nice-shadow">
              <CheckCircle size={28} className="text-emerald-600 mx-auto mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Scenario Complete!</h4>
              <button onClick={() => setPreviewCurrentId(currentScenarioId)} className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm">
                <RotateCcw size={14} className="inline mr-1" />Start Over
              </button>
            </div>
          ) : previewScenario ? (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 nice-shadow">
                <p className="text-neutral-800 font-medium">{previewScenario.text}</p>
              </div>
              <div className="space-y-2">
                {previewScenario.options.map((option, index) => (
                  <button key={option.id} onClick={() => option.nextScenarioId ? setPreviewCurrentId(option.nextScenarioId) : setPreviewCurrentId('end')}
                    className="w-full bg-white border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg p-3 text-left group">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-neutral-100 group-hover:bg-blue-100 rounded-md flex items-center justify-center text-sm font-bold text-neutral-600 group-hover:text-blue-600">
                        {getOptionLetter(index)}
                      </div>
                      <span className="flex-1 text-neutral-700 font-medium group-hover:text-blue-900">{option.text}</span>
                      <ArrowRight size={16} className="text-neutral-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null
        })()}

        {/* View / read mode */}
        {(!isEditable || !isEditing) && (
          isEditable ? (
            <div className="bg-white rounded-lg p-4 nice-shadow">
              <input value={title} placeholder="Scenario Title" onChange={(e) => { setTitle(e.target.value); props.updateAttributes({ title: e.target.value }) }}
                className="text-neutral-800 bg-transparent border-2 border-dashed border-neutral-200 rounded-lg text-base font-semibold w-full p-2 focus:border-neutral-300 outline-none mb-3" />
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
                <p className="text-neutral-600 text-sm">{scenarios.length}/40 scenarios configured</p>
                <p className="text-neutral-500 text-xs mt-1">Click "Edit Scenarios" to configure your interactive branching story</p>
              </div>
            </div>
          ) : scenarioComplete ? (
            <div className="bg-white rounded-lg p-6 nice-shadow text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-neutral-900 mb-2">Scenario Complete!</h4>
              <p className="text-neutral-600 mb-6">You've successfully navigated through this interactive scenario.</p>
              <button onClick={resetScenario} className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium">
                <RotateCcw size={16} />Start Over
              </button>
            </div>
          ) : (() => {
            const currentScenario = getCurrentScenario()
            if (!currentScenario) return (
              <div className="bg-white rounded-lg p-6 nice-shadow text-center">
                <GitBranch size={20} className="text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500 text-sm">Scenario not found.</p>
              </div>
            )
            return (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-5 nice-shadow">
                  {currentScenario.imageUrl && (
                    <img src={currentScenario.imageUrl} alt="Scenario" className="w-full h-48 object-cover rounded-lg mb-4 border border-neutral-200"
                      onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  )}
                  <p className="text-base text-neutral-800 leading-relaxed font-medium">{currentScenario.text}</p>
                </div>
                <div className="space-y-2">
                  {currentScenario.options.map((option, index) => (
                    <button key={option.id} onClick={() => handleOptionClick(option.nextScenarioId)}
                      className="w-full bg-white border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg p-3 transition-all group text-left nice-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-neutral-100 group-hover:bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0 transition-colors">
                          <span className="text-sm font-bold text-neutral-600 group-hover:text-blue-600">{getOptionLetter(index)}</span>
                        </div>
                        <div className="flex-1 text-neutral-700 font-medium group-hover:text-blue-900">{option.text}</div>
                        <ArrowRight size={16} className="text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })()
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ScenariosExtension
