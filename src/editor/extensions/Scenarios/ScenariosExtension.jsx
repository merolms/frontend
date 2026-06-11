import { NodeViewWrapper } from "@tiptap/react";
import {
  ArrowRight,
  CheckCircle,
  GitBranch,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { useEditorProvider } from "@/contexts/EditorContext";

const ScenariosExtension = (props) => {
  const [title, setTitle] = useState(props.node.attrs.title);
  const [scenarios, setScenarios] = useState(props.node.attrs.scenarios);
  const [currentScenarioId, setCurrentScenarioId] = useState(props.node.attrs.currentScenarioId);
  const [isEditing, setIsEditing] = useState(false);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCurrentId, setPreviewCurrentId] = useState(props.node.attrs.currentScenarioId);
  const editorState = useEditorProvider();
  const isEditable = editorState?.isEditable ?? true;

  const getCurrentScenario = (scenarioId = currentScenarioId) =>
    scenarios.find((s) => s.id === scenarioId) || null;

  const saveAll = (newTitle, newScenarios, newCurrentId) => {
    setTitle(newTitle);
    setScenarios(newScenarios);
    setCurrentScenarioId(newCurrentId);
    props.updateAttributes({
      title: newTitle,
      scenarios: newScenarios,
      currentScenarioId: newCurrentId,
    });
  };

  const handleOptionClick = (nextScenarioId) => {
    if (nextScenarioId) {
      setCurrentScenarioId(nextScenarioId);
      setScenarioComplete(false);
    } else setScenarioComplete(true);
  };

  const resetScenario = () => {
    setCurrentScenarioId(scenarios[0]?.id || "1");
    setScenarioComplete(false);
  };
  const getOptionLetter = (index) => String.fromCharCode("A".charCodeAt(0) + index);

  // Inline editor helpers
  const addScenario = () => {
    if (scenarios.length >= 40) return;
    const newId = (Math.max(...scenarios.map((s) => parseInt(s.id) || 0)) + 1).toString();
    const newScenario = {
      id: newId,
      text: "New scenario text...",
      imageUrl: "",
      options: [{ id: `opt${Date.now()}`, text: "Option 1", nextScenarioId: null }],
    };
    const updated = [...scenarios, newScenario];
    setScenarios(updated);
    props.updateAttributes({ scenarios: updated });
  };

  const deleteScenario = (scenarioId) => {
    if (scenarios.length <= 1) return;
    const updated = scenarios
      .filter((s) => s.id !== scenarioId)
      .map((s) => ({
        ...s,
        options: s.options.map((o) => ({
          ...o,
          nextScenarioId: o.nextScenarioId === scenarioId ? null : o.nextScenarioId,
        })),
      }));
    setScenarios(updated);
    if (currentScenarioId === scenarioId) setCurrentScenarioId(updated[0]?.id || "1");
    props.updateAttributes({ scenarios: updated });
  };

  const updateScenario = (scenarioId, updates) => {
    const updated = scenarios.map((s) => (s.id === scenarioId ? { ...s, ...updates } : s));
    setScenarios(updated);
    props.updateAttributes({ scenarios: updated });
  };

  const addOption = (scenarioId) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario || scenario.options.length >= 4) return;
    updateScenario(scenarioId, {
      options: [
        ...scenario.options,
        { id: `opt${Date.now()}`, text: "New option", nextScenarioId: null },
      ],
    });
  };

  const deleteOption = (scenarioId, optionId) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario || scenario.options.length <= 1) return;
    updateScenario(scenarioId, { options: scenario.options.filter((o) => o.id !== optionId) });
  };

  const updateOption = (scenarioId, optionId, updates) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    updateScenario(scenarioId, {
      options: scenario.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
    });
  };

  return (
    <NodeViewWrapper className="block-scenarios">
      <div className="nice-shadow rounded-xl bg-neutral-50 px-5 py-4 transition-all ease-linear">
        {/* Header */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="text-neutral-400" size={16} />
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Interactive Scenario
            </span>
          </div>
          {scenarioComplete && !isEditable && (
            <div className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
              Scenario Complete!
            </div>
          )}
          <div className="grow" />
          {isEditable ? (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-secondary transition-colors outline-none"
                  >
                    <Play size={12} />
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-700 px-3 py-1.5 text-xs font-medium text-secondary transition-colors outline-none"
                  >
                    <Save size={12} />
                    Done
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowPreview(false);
                  }}
                  className="rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors outline-none hover:bg-neutral-300"
                >
                  Edit Scenarios
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={resetScenario}
              className="rounded-md p-1.5 transition-colors hover:bg-neutral-200"
              title="Reset scenario"
            >
              <RefreshCcw className="text-neutral-500" size={15} />
            </button>
          )}
        </div>

        {/* Edit mode */}
        {isEditable && isEditing && !showPreview && (
          <div className="space-y-3">
            <div className="nice-shadow rounded-lg bg-white p-3">
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Title</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  props.updateAttributes({ title: e.target.value });
                }}
                placeholder="Scenario Title"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              />
            </div>
            <div className="text-center text-xs text-neutral-500">
              {scenarios.length}/40 scenarios
            </div>
            {scenarios.map((scenario, si) => (
              <div
                key={scenario.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-neutral-200 text-xs font-bold text-neutral-700">
                      {si + 1}
                    </span>
                    <span className="text-sm font-semibold text-neutral-800">
                      Scenario {scenario.id}
                    </span>
                    {scenario.id === currentScenarioId && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Start
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCurrentScenarioId(scenario.id);
                        props.updateAttributes({ currentScenarioId: scenario.id });
                      }}
                      className={`rounded px-2 py-1 text-xs font-medium ${scenario.id === currentScenarioId ? "bg-emerald-500 text-secondary" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
                    >
                      {scenario.id === currentScenarioId ? "Start" : "Set Start"}
                    </button>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      disabled={scenarios.length <= 1}
                      className="rounded p-1.5 text-neutral-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
                      Description
                    </label>
                    <textarea
                      value={scenario.text}
                      onChange={(e) => updateScenario(scenario.id, { text: e.target.value })}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                      placeholder="What happens in this scenario..."
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-600">
                        Options ({scenario.options.length}/4)
                      </label>
                      <button
                        onClick={() => addOption(scenario.id)}
                        disabled={scenario.options.length >= 4}
                        className="flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {scenario.options.map((option, oi) => (
                        <div
                          key={option.id}
                          className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2"
                        >
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-xs font-bold text-neutral-600">
                            {getOptionLetter(oi)}
                          </span>
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) =>
                                updateOption(scenario.id, option.id, { text: e.target.value })
                              }
                              className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-400"
                              placeholder="Option text..."
                            />
                            <select
                              value={option.nextScenarioId || ""}
                              onChange={(e) =>
                                updateOption(scenario.id, option.id, {
                                  nextScenarioId: e.target.value || null,
                                })
                              }
                              className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs outline-none focus:border-neutral-400"
                            >
                              <option value="">End scenario</option>
                              {scenarios.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Scenario {s.id}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => deleteOption(scenario.id, option.id)}
                            disabled={scenario.options.length <= 1}
                            className="flex-shrink-0 rounded p-1 text-neutral-400 hover:text-red-500 disabled:opacity-30"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addScenario}
              disabled={scenarios.length >= 40}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-40"
            >
              <Plus size={14} />
              Add Scenario
            </button>
          </div>
        )}

        {/* Preview mode (in edit) */}
        {isEditable &&
          isEditing &&
          showPreview &&
          (() => {
            const previewScenario = scenarios.find((s) => s.id === previewCurrentId) || null;
            return previewCurrentId === "end" ? (
              <div className="nice-shadow rounded-lg bg-white p-6 text-center">
                <CheckCircle size={28} className="mx-auto mb-3 text-emerald-600" />
                <h4 className="mb-2 font-bold text-neutral-900">Scenario Complete!</h4>
                <button
                  onClick={() => setPreviewCurrentId(currentScenarioId)}
                  className="rounded-lg bg-neutral-700 px-4 py-2 text-sm text-secondary"
                >
                  <RotateCcw size={14} className="mr-1 inline" />
                  Start Over
                </button>
              </div>
            ) : previewScenario ? (
              <div className="space-y-3">
                <div className="nice-shadow rounded-lg bg-white p-4">
                  <p className="font-medium text-neutral-800">{previewScenario.text}</p>
                </div>
                <div className="space-y-2">
                  {previewScenario.options.map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        option.nextScenarioId
                          ? setPreviewCurrentId(option.nextScenarioId)
                          : setPreviewCurrentId("end")
                      }
                      className="group w-full rounded-lg border border-neutral-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-sm font-bold text-neutral-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                          {getOptionLetter(index)}
                        </div>
                        <span className="flex-1 font-medium text-neutral-700 group-hover:text-blue-900">
                          {option.text}
                        </span>
                        <ArrowRight
                          size={16}
                          className="text-neutral-400 group-hover:text-blue-500"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

        {/* View / read mode */}
        {(!isEditable || !isEditing) &&
          (isEditable ? (
            <div className="nice-shadow rounded-lg bg-white p-4">
              <input
                value={title}
                placeholder="Scenario Title"
                onChange={(e) => {
                  setTitle(e.target.value);
                  props.updateAttributes({ title: e.target.value });
                }}
                className="mb-3 w-full rounded-lg border-2 border-dashed border-neutral-200 bg-transparent p-2 text-base font-semibold text-neutral-800 outline-none focus:border-neutral-300"
              />
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
                <p className="text-sm text-neutral-600">
                  {scenarios.length}/40 scenarios configured
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Click "Edit Scenarios" to configure your interactive branching story
                </p>
              </div>
            </div>
          ) : scenarioComplete ? (
            <div className="nice-shadow rounded-lg bg-white p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h4 className="mb-2 text-xl font-bold text-neutral-900">Scenario Complete!</h4>
              <p className="mb-6 text-neutral-600">
                You've successfully navigated through this interactive scenario.
              </p>
              <button
                onClick={resetScenario}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-secondary hover:bg-neutral-800"
              >
                <RotateCcw size={16} />
                Start Over
              </button>
            </div>
          ) : (
            (() => {
              const currentScenario = getCurrentScenario();
              if (!currentScenario)
                return (
                  <div className="nice-shadow rounded-lg bg-white p-6 text-center">
                    <GitBranch size={20} className="mx-auto mb-2 text-neutral-400" />
                    <p className="text-sm text-neutral-500">Scenario not found.</p>
                  </div>
                );
              return (
                <div className="space-y-4">
                  <div className="nice-shadow rounded-lg bg-white p-5">
                    {currentScenario.imageUrl && (
                      <img
                        src={currentScenario.imageUrl}
                        alt="Scenario"
                        className="mb-4 h-48 w-full rounded-lg border border-neutral-200 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <p className="text-base leading-relaxed font-medium text-neutral-800">
                      {currentScenario.text}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {currentScenario.options.map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.nextScenarioId)}
                        className="group nice-shadow w-full rounded-lg border border-neutral-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 transition-colors group-hover:bg-blue-100">
                            <span className="text-sm font-bold text-neutral-600 group-hover:text-blue-600">
                              {getOptionLetter(index)}
                            </span>
                          </div>
                          <div className="flex-1 font-medium text-neutral-700 group-hover:text-blue-900">
                            {option.text}
                          </div>
                          <ArrowRight
                            size={16}
                            className="text-neutral-400 transition-all group-hover:translate-x-1 group-hover:text-blue-500"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()
          ))}
      </div>
    </NodeViewWrapper>
  );
};

export default ScenariosExtension;
