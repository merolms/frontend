import React, { useState, useCallback } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

// ─── TipTap node definition ──────────────────────────────────
export const QuizBlock = Node.create({
  name: 'blockQuiz',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      questions: {
        default: [],
        parseHTML: el => {
          try { return JSON.parse(el.getAttribute('data-questions') || '[]'); } catch { return []; }
        },
        renderHTML: attrs => ({ 'data-questions': JSON.stringify(attrs.questions) }),
      },
    };
  },

  parseHTML()  { return [{ tag: 'block-quiz' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['block-quiz', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuizBlockComponent);
  },
});

// ─── helpers ─────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const makeQuestion = () => ({
  id: uid(),
  text: '',
  options: [
    { id: uid(), text: '', correct: true },
    { id: uid(), text: '', correct: false },
  ],
});

// ─── React component ─────────────────────────────────────────
function QuizBlockComponent({ node, updateAttributes }) {
  const [questions, setQuestions] = useState(() => node.attrs.questions || []);

  const save = useCallback(qs => {
    setQuestions(qs);
    updateAttributes({ questions: qs });
  }, [updateAttributes]);

  const addQuestion    = ()        => save([...questions, makeQuestion()]);
  const removeQuestion = id        => save(questions.filter(q => q.id !== id));
  const updateQuestion = (id, txt) => save(questions.map(q => q.id === id ? { ...q, text: txt } : q));

  const addOption    = qid        => save(questions.map(q => q.id === qid ? { ...q, options: [...q.options, { id: uid(), text: '', correct: false }] } : q));
  const removeOption = (qid, oid) => save(questions.map(q => q.id === qid ? { ...q, options: q.options.filter(o => o.id !== oid) } : q));
  const updateOption = (qid, oid, txt) => save(questions.map(q => q.id === qid ? { ...q, options: q.options.map(o => o.id === oid ? { ...o, text: txt } : o) } : q));
  const setCorrect   = (qid, oid) => save(questions.map(q => q.id === qid ? { ...q, options: q.options.map(o => ({ ...o, correct: o.id === oid })) } : q));

  return (
    <NodeViewWrapper>
      <div className="lh-block lh-block--quiz">
        <div className="lh-block-header">
          <span className="lh-block-label">❓ Quiz</span>
          <button className="lh-action-btn" onClick={addQuestion}>+ Add question</button>
        </div>

        {questions.length === 0 && (
          <p className="lh-block-empty">No questions yet — click "Add question" to start.</p>
        )}

        {questions.map((q, qi) => (
          <div key={q.id} className="lh-quiz-q">
            <div className="lh-quiz-q-row">
              <span className="lh-quiz-q-num">Q{qi + 1}</span>
              <input
                className="lh-quiz-q-input"
                placeholder="Question…"
                value={q.text}
                onChange={e => updateQuestion(q.id, e.target.value)}
              />
              <button className="lh-quiz-del" onClick={() => removeQuestion(q.id)}>✕</button>
            </div>

            {q.options.map(o => (
              <div key={o.id} className="lh-quiz-opt">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={o.correct}
                  onChange={() => setCorrect(q.id, o.id)}
                  title="Mark correct"
                />
                <input
                  className="lh-quiz-opt-input"
                  placeholder="Answer option…"
                  value={o.text}
                  onChange={e => updateOption(q.id, o.id, e.target.value)}
                />
                <button className="lh-quiz-del" onClick={() => removeOption(q.id, o.id)}>✕</button>
              </div>
            ))}

            <button className="lh-quiz-add-opt" onClick={() => addOption(q.id)}>+ Add option</button>
          </div>
        ))}
      </div>
    </NodeViewWrapper>
  );
}
