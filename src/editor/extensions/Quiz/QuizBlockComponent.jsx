import { NodeViewWrapper } from '@tiptap/react'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '../../../lib/utils'
import React from 'react'
import { BadgeHelp, Check, Minus, Plus, RefreshCcw } from 'lucide-react'
import ReactConfetti from 'react-confetti'
import { useEditorProvider } from '../../../contexts/EditorContext'

function QuizBlockComponent(props) {
  const [questions, setQuestions] = React.useState(props.node.attrs.questions)
  const [userAnswers, setUserAnswers] = React.useState([])
  const [submitted, setSubmitted] = React.useState(false)
  const [submissionMessage, setSubmissionMessage] = React.useState('')
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable

  const handleAnswerClick = (question_id, answer_id) => {
    if (submitted) return
    const existingAnswerIndex = userAnswers.findIndex(
      (answer) => answer.question_id === question_id && answer.answer_id === answer_id
    )
    if (existingAnswerIndex !== -1) {
      setUserAnswers(userAnswers.filter((_, index) => index !== existingAnswerIndex))
    } else {
      setUserAnswers([...userAnswers, { question_id, answer_id }])
    }
  }

  const refreshUserSubmission = () => {
    setUserAnswers([])
    setSubmitted(false)
    setSubmissionMessage('')
  }

  const handleUserSubmission = () => {
    setSubmitted(true)
    const allCorrect = questions.every((question) => {
      const correctAnswers = question.answers.filter((answer) => answer.correct)
      const userAnswersForQuestion = userAnswers.filter(
        (userAnswer) => userAnswer.question_id === question.question_id
      )
      if (correctAnswers.length === 0 && userAnswersForQuestion.length === 0) return true
      return (
        correctAnswers.length === userAnswersForQuestion.length &&
        correctAnswers.every((correctAnswer) =>
          userAnswersForQuestion.some((userAnswer) => userAnswer.answer_id === correctAnswer.answer_id)
        )
      )
    })
    setSubmissionMessage(allCorrect ? 'correct' : 'incorrect')
  }

  const getAnswerID = (answerIndex) => {
    return String.fromCharCode('A'.charCodeAt(0) + answerIndex)
  }

  const saveQuestions = (newQuestions) => {
    props.updateAttributes({ questions: newQuestions })
    setQuestions(newQuestions)
  }

  const addSampleQuestion = () => {
    const newQuestion = {
      question_id: uuidv4(),
      question: '',
      type: 'multiple_choice',
      answers: [{ answer_id: uuidv4(), answer: '', correct: false }],
    }
    setQuestions([...questions, newQuestion])
  }

  const addAnswer = (question_id) => {
    const question = questions.find((q) => q.question_id === question_id)
    if (question.answers.length >= 5) return
    const newAnswer = { answer_id: uuidv4(), answer: '', correct: false }
    const newQuestions = questions.map((q) => {
      if (q.question_id === question_id) {
        return { ...q, answers: [...q.answers, newAnswer] }
      }
      return q
    })
    saveQuestions(newQuestions)
  }

  const changeAnswerValue = (question_id, answer_id, value) => {
    const newQuestions = questions.map((question) => {
      if (question.question_id === question_id) {
        return {
          ...question,
          answers: question.answers.map((answer) =>
            answer.answer_id === answer_id ? { ...answer, answer: value } : answer
          ),
        }
      }
      return question
    })
    saveQuestions(newQuestions)
  }

  const changeQuestionValue = (question_id, value) => {
    const newQuestions = questions.map((question) =>
      question.question_id === question_id ? { ...question, question: value } : question
    )
    saveQuestions(newQuestions)
  }

  const deleteQuestion = (question_id) => {
    saveQuestions(questions.filter((q) => q.question_id !== question_id))
  }

  const deleteAnswer = (question_id, answer_id) => {
    const newQuestions = questions.map((question) => {
      if (question.question_id === question_id) {
        return { ...question, answers: question.answers.filter((a) => a.answer_id !== answer_id) }
      }
      return question
    })
    saveQuestions(newQuestions)
  }

  const markAnswerCorrect = (question_id, answer_id) => {
    const newQuestions = questions.map((question) => {
      if (question.question_id === question_id) {
        return {
          ...question,
          answers: question.answers.map((answer) => ({
            ...answer,
            correct: answer.answer_id === answer_id ? !answer.correct : answer.correct,
          })),
        }
      }
      return question
    })
    saveQuestions(newQuestions)
  }

  return (
    <NodeViewWrapper className="block-quiz">
      <div className="bg-neutral-50 rounded-xl px-5 py-4 nice-shadow transition-all ease-linear">
        <div className="flex flex-wrap gap-2 items-center text-sm mb-3">
          {submitted && submissionMessage === 'correct' && (
            <ReactConfetti numberOfPieces={1400} recycle={false} className="w-full h-screen" />
          )}
          <div className="flex items-center gap-2">
            <BadgeHelp className="text-neutral-400" size={16} />
            <span className="uppercase tracking-widest text-xs font-bold text-neutral-400">Quiz</span>
          </div>

          {submitted && (
            <div className={cn(
              "text-xs font-medium px-2 py-1 rounded-md",
              submissionMessage === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}>
              {submissionMessage === 'correct' ? 'All correct!' : 'Some answers are incorrect'}
            </div>
          )}

          <div className="grow"></div>

          {isEditable ? (
            <button onClick={addSampleQuestion} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors outline-none">
              Add Question
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={refreshUserSubmission} className="p-1.5 rounded-md hover:bg-neutral-200 transition-colors" title="Reset answers">
                <RefreshCcw className="text-neutral-500" size={15} />
              </button>
              <button onClick={handleUserSubmission} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors outline-none">
                Submit
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.question_id} className="bg-white rounded-lg p-4 nice-shadow">
              <div className="flex items-start gap-2 mb-3">
                <div className="flex-1">
                  {isEditable ? (
                    <input
                      value={question.question}
                      placeholder="Enter your question..."
                      onChange={(e) => changeQuestionValue(question.question_id, e.target.value)}
                      className="text-neutral-800 bg-transparent border-2 border-dashed border-neutral-200 rounded-lg text-base font-semibold w-full p-2 focus:border-neutral-300 outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-neutral-800 text-base font-semibold p-2 break-words">{question.question}</p>
                  )}
                </div>
                {isEditable && (
                  <button onClick={() => deleteQuestion(question.question_id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors">
                    <Minus className="text-neutral-500" size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {question.answers.map((answer, answerIdx) => {
                  const isSelected = userAnswers.some(
                    (ua) => ua.question_id === question.question_id && ua.answer_id === answer.answer_id
                  )
                  const isCorrectAnswer = answer.correct
                  const isIncorrectSelection = submitted && isSelected && !isCorrectAnswer
                  const isCorrectSelection = submitted && isCorrectAnswer

                  return (
                    <div
                      key={answer.answer_id}
                      onClick={() => handleAnswerClick(question.question_id, answer.answer_id)}
                      className={cn(
                        "flex items-stretch rounded-lg border-2 transition-all cursor-pointer min-h-[44px]",
                        !isEditable && !submitted && !isSelected && "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100",
                        !isEditable && !submitted && isSelected && "border-blue-400 bg-blue-50",
                        submitted && isCorrectAnswer && "border-emerald-400 bg-emerald-50",
                        isIncorrectSelection && "border-red-400 bg-red-50",
                        isEditable && isCorrectAnswer && "border-emerald-400 bg-emerald-50",
                        isEditable && !isCorrectAnswer && "border-neutral-200 bg-neutral-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 flex items-center justify-center rounded-l-md font-bold text-sm flex-shrink-0",
                        !isEditable && !submitted && !isSelected && "bg-neutral-100 text-neutral-600",
                        !isEditable && !submitted && isSelected && "bg-blue-400 text-white",
                        submitted && isCorrectAnswer && "bg-emerald-400 text-white",
                        isIncorrectSelection && "bg-red-400 text-white",
                        isEditable && isCorrectAnswer && "bg-emerald-400 text-white",
                        isEditable && !isCorrectAnswer && "bg-neutral-100 text-neutral-600"
                      )}>
                        {getAnswerID(answerIdx)}
                      </div>

                      <div className="flex-1 flex items-center px-3 py-2">
                        {isEditable ? (
                          <input
                            value={answer.answer}
                            onChange={(e) => changeAnswerValue(question.question_id, answer.answer_id, e.target.value)}
                            placeholder="Enter answer..."
                            className="w-full text-neutral-700 bg-transparent border-0 text-sm font-medium outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-neutral-700 text-sm font-medium break-words">{answer.answer}</span>
                        )}
                      </div>

                      {isEditable && (
                        <div className="flex items-center gap-1 px-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); markAnswerCorrect(question.question_id, answer.answer_id) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
                            title={answer.correct ? 'Mark incorrect' : 'Mark correct'}
                          >
                            <Check className="text-emerald-700" size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAnswer(question.question_id, answer.answer_id) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                            title="Delete answer"
                          >
                            <Minus className="text-neutral-500" size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {isEditable && (
                  <button
                    onClick={() => addAnswer(question.question_id)}
                    className="w-full flex items-center justify-center gap-1 h-11 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                  >
                    <Plus size={15} />
                    <span className="text-sm font-medium">Add Answer</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default QuizBlockComponent
