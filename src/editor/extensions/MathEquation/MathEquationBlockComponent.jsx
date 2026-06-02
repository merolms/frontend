import { NodeViewWrapper } from '@tiptap/react'
import React, { lazy, Suspense } from 'react'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import { Save, Sigma, ExternalLink, ChevronDown, BookOpen, Lightbulb } from 'lucide-react'
import { useEditorProvider } from '../../../contexts/EditorContext'

const mathTemplates = [
  { name: 'Fraction', latex: '\\frac{a}{b}', description: 'Simple fraction' },
  { name: 'Square Root', latex: '\\sqrt{x}', description: 'Square root' },
  { name: 'Summation', latex: '\\sum_{i=1}^{n} x_i', description: 'Sum with limits' },
  { name: 'Integral', latex: '\\int_{a}^{b} f(x) \\, dx', description: 'Definite integral' },
  { name: 'Limit', latex: '\\lim_{x \\to \\infty} f(x)', description: 'Limit expression' },
  { name: 'Matrix 2×2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', description: '2×2 matrix with parentheses' },
  { name: 'Binomial', latex: '\\binom{n}{k}', description: 'Binomial coefficient' },
  { name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Solution to quadratic equation' },
  { name: 'Vector', latex: '\\vec{v} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}', description: '3D vector' },
  { name: 'System of Equations', latex: '\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}', description: 'System of linear equations' },
]

const mathSymbols = [
  { symbol: '\\alpha', display: 'α' }, { symbol: '\\beta', display: 'β' },
  { symbol: '\\gamma', display: 'γ' }, { symbol: '\\delta', display: 'δ' },
  { symbol: '\\theta', display: 'θ' }, { symbol: '\\pi', display: 'π' },
  { symbol: '\\sigma', display: 'σ' }, { symbol: '\\infty', display: '∞' },
  { symbol: '\\pm', display: '±' }, { symbol: '\\div', display: '÷' },
  { symbol: '\\cdot', display: '·' }, { symbol: '\\leq', display: '≤' },
  { symbol: '\\geq', display: '≥' }, { symbol: '\\neq', display: '≠' },
  { symbol: '\\approx', display: '≈' },
]

function MathEquationBlockComponent(props) {
  const [equation, setEquation] = React.useState(props.node.attrs.equation || 'E = mc^2')
  const [showTemplates, setShowTemplates] = React.useState(false)
  const [showSymbols, setShowSymbols] = React.useState(false)
  const [showHelp, setShowHelp] = React.useState(false)
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable
  const inputRef = React.useRef(null)
  const templatesRef = React.useRef(null)
  const symbolsRef = React.useRef(null)
  const helpRef = React.useRef(null)

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (templatesRef.current && !templatesRef.current.contains(event.target)) setShowTemplates(false)
      if (symbolsRef.current && !symbolsRef.current.contains(event.target)) setShowSymbols(false)
      if (helpRef.current && !helpRef.current.contains(event.target)) setShowHelp(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEquationChange = (event) => {
    setEquation(event.target.value)
    props.updateAttributes({ equation: event.target.value })
  }

  const saveEquation = () => {
    props.updateAttributes({ equation })
  }

  const insertTemplate = (template) => {
    setEquation(template)
    props.updateAttributes({ equation: template })
    setShowTemplates(false)
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(template.length, template.length)
    }
  }

  const insertSymbol = (symbol) => {
    const cursorPosition = inputRef.current?.selectionStart || equation.length
    const newEquation = equation.substring(0, cursorPosition) + symbol + equation.substring(cursorPosition)
    setEquation(newEquation)
    props.updateAttributes({ equation: newEquation })
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(cursorPosition + symbol.length, cursorPosition + symbol.length)
      }
    }, 0)
  }

  if (!isEditable) {
    return (
      <NodeViewWrapper className="block-math-equation">
        <div className="bg-neutral-50 rounded-xl p-5 nice-shadow">
          <BlockMath>{equation}</BlockMath>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="block-math-equation">
      <div className="bg-neutral-50 rounded-xl px-5 py-4 nice-shadow transition-all ease-linear">
        <div className="flex items-center gap-2 mb-3">
          <Sigma className="text-neutral-400" size={16} />
          <span className="uppercase tracking-widest text-xs font-bold text-neutral-400">Math</span>
        </div>

        <div className="bg-white p-4 rounded-lg nice-shadow">
          <BlockMath>{equation}</BlockMath>
        </div>

        {isEditable && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {/* Templates */}
              <div ref={templatesRef} className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-sm transition-colors outline-none"
                >
                  <BookOpen size={14} />
                  <span>Templates</span>
                  <ChevronDown size={14} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                </button>
                {showTemplates && (
                  <div className="absolute left-0 mt-1 z-10 w-64 max-h-80 overflow-y-auto bg-white rounded-lg border border-neutral-200 nice-shadow">
                    <div className="p-2 text-xs text-neutral-500 border-b border-neutral-100">Select a template</div>
                    {mathTemplates.map((template, index) => (
                      <div key={index} onClick={() => insertTemplate(template.latex)} className="px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors">
                        <span className="font-medium text-neutral-700 block">{template.name}</span>
                        <span className="text-xs text-neutral-500">{template.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Symbols */}
              <div ref={symbolsRef} className="relative">
                <button
                  onClick={() => setShowSymbols(!showSymbols)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-sm transition-colors outline-none"
                >
                  <Sigma size={14} />
                  <span>Symbols</span>
                  <ChevronDown size={14} className={`transition-transform ${showSymbols ? 'rotate-180' : ''}`} />
                </button>
                {showSymbols && (
                  <div className="absolute left-0 mt-1 z-10 w-64 bg-white rounded-lg border border-neutral-200 nice-shadow">
                    <div className="p-2 text-xs text-neutral-500 border-b border-neutral-100">Click to insert symbol</div>
                    <div className="flex flex-wrap p-2 gap-1">
                      {mathSymbols.map((symbol, index) => (
                        <button key={index} onClick={() => insertSymbol(symbol.symbol)} title={symbol.symbol}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 rounded text-base text-neutral-700 transition-colors">
                          {symbol.display}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Help */}
              <div ref={helpRef} className="relative">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-sm transition-colors outline-none"
                >
                  <Lightbulb size={14} />
                  <span>Help</span>
                  <ChevronDown size={14} className={`transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                </button>
                {showHelp && (
                  <div className="absolute left-0 mt-1 z-10 w-72 bg-white rounded-lg border border-neutral-200 nice-shadow">
                    <div className="p-2 text-xs font-medium text-neutral-700 border-b border-neutral-100">Quick Reference</div>
                    <div className="p-3 text-xs space-y-2 text-neutral-600">
                      <div><span className="font-medium">Fractions:</span> \frac{'{'}num{'}'}{'{'}denom{'}'}</div>
                      <div><span className="font-medium">Exponents:</span> x^{'{'}power{'}'}</div>
                      <div><span className="font-medium">Subscripts:</span> x_{'{'}subscript{'}'}</div>
                      <div><span className="font-medium">Square root:</span> \sqrt{'{'}x{'}'}</div>
                      <div className="pt-2 border-t border-neutral-100">
                        <a className="text-blue-600 hover:text-blue-800 font-medium flex items-center" href="https://katex.org/docs/supported.html" target="_blank" rel="noopener noreferrer">
                          View full reference <ExternalLink size={10} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1.5 focus-within:border-neutral-300 transition-colors">
              <input
                ref={inputRef}
                value={equation}
                onChange={handleEquationChange}
                placeholder="Enter LaTeX equation..."
                type="text"
                className="flex-1 px-3 py-2 text-sm text-neutral-700 placeholder-slate-400 bg-transparent border-none outline-none"
              />
              <button onClick={saveEquation} className="flex items-center justify-center w-8 h-8 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-md transition-colors">
                <Save size={15} />
              </button>
            </div>

            <div className="flex items-center text-neutral-500 text-sm">
              <span>Refer to the </span>
              <a className="inline-flex items-center mx-1 text-blue-600 hover:text-blue-800 font-medium" href="https://katex.org/docs/supported.html" target="_blank" rel="noopener noreferrer">
                KaTeX guide <ExternalLink size={12} className="ml-1" />
              </a>
              <span>for supported functions.</span>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default MathEquationBlockComponent
