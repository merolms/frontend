import "katex/dist/katex.min.css";

import { NodeViewWrapper } from "@tiptap/react";
import { BookOpen, ChevronDown, ExternalLink, Lightbulb, Save, Sigma } from "lucide-react";
import React from "react";
import { BlockMath } from "react-katex";

import { useEditorProvider } from "../../../contexts/EditorContext";

const mathTemplates = [
  { name: "Fraction", latex: "\\frac{a}{b}", description: "Simple fraction" },
  { name: "Square Root", latex: "\\sqrt{x}", description: "Square root" },
  { name: "Summation", latex: "\\sum_{i=1}^{n} x_i", description: "Sum with limits" },
  { name: "Integral", latex: "\\int_{a}^{b} f(x) \\, dx", description: "Definite integral" },
  { name: "Limit", latex: "\\lim_{x \\to \\infty} f(x)", description: "Limit expression" },
  {
    name: "Matrix 2×2",
    latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
    description: "2×2 matrix with parentheses",
  },
  { name: "Binomial", latex: "\\binom{n}{k}", description: "Binomial coefficient" },
  {
    name: "Quadratic Formula",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    description: "Solution to quadratic equation",
  },
  {
    name: "Vector",
    latex: "\\vec{v} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}",
    description: "3D vector",
  },
  {
    name: "System of Equations",
    latex: "\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}",
    description: "System of linear equations",
  },
];

const mathSymbols = [
  { symbol: "\\alpha", display: "α" },
  { symbol: "\\beta", display: "β" },
  { symbol: "\\gamma", display: "γ" },
  { symbol: "\\delta", display: "δ" },
  { symbol: "\\theta", display: "θ" },
  { symbol: "\\pi", display: "π" },
  { symbol: "\\sigma", display: "σ" },
  { symbol: "\\infty", display: "∞" },
  { symbol: "\\pm", display: "±" },
  { symbol: "\\div", display: "÷" },
  { symbol: "\\cdot", display: "·" },
  { symbol: "\\leq", display: "≤" },
  { symbol: "\\geq", display: "≥" },
  { symbol: "\\neq", display: "≠" },
  { symbol: "\\approx", display: "≈" },
];

function MathEquationBlockComponent(props) {
  const [equation, setEquation] = React.useState(props.node.attrs.equation || "E = mc^2");
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showSymbols, setShowSymbols] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;
  const inputRef = React.useRef(null);
  const templatesRef = React.useRef(null);
  const symbolsRef = React.useRef(null);
  const helpRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (templatesRef.current && !templatesRef.current.contains(event.target))
        setShowTemplates(false);
      if (symbolsRef.current && !symbolsRef.current.contains(event.target)) setShowSymbols(false);
      if (helpRef.current && !helpRef.current.contains(event.target)) setShowHelp(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEquationChange = (event) => {
    setEquation(event.target.value);
    props.updateAttributes({ equation: event.target.value });
  };

  const saveEquation = () => {
    props.updateAttributes({ equation });
  };

  const insertTemplate = (template) => {
    setEquation(template);
    props.updateAttributes({ equation: template });
    setShowTemplates(false);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(template.length, template.length);
    }
  };

  const insertSymbol = (symbol) => {
    const cursorPosition = inputRef.current?.selectionStart || equation.length;
    const newEquation =
      equation.substring(0, cursorPosition) + symbol + equation.substring(cursorPosition);
    setEquation(newEquation);
    props.updateAttributes({ equation: newEquation });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          cursorPosition + symbol.length,
          cursorPosition + symbol.length
        );
      }
    }, 0);
  };

  if (!isEditable) {
    return (
      <NodeViewWrapper className="block-math-equation">
        <div className="nice-shadow rounded-xl bg-neutral-50 p-5">
          <BlockMath>{equation}</BlockMath>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="block-math-equation">
      <div className="nice-shadow rounded-xl bg-neutral-50 px-5 py-4 transition-all ease-linear">
        <div className="mb-3 flex items-center gap-2">
          <Sigma className="text-neutral-400" size={16} />
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Math</span>
        </div>

        <div className="nice-shadow rounded-lg bg-white p-4">
          <BlockMath>{equation}</BlockMath>
        </div>

        {isEditable && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {/* Templates */}
              <div ref={templatesRef} className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors outline-none hover:bg-neutral-300"
                >
                  <BookOpen size={14} />
                  <span>Templates</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showTemplates ? "rotate-180" : ""}`}
                  />
                </button>
                {showTemplates && (
                  <div className="nice-shadow absolute left-0 z-10 mt-1 max-h-80 w-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-100 p-2 text-xs text-neutral-500">
                      Select a template
                    </div>
                    {mathTemplates.map((template, index) => (
                      <div
                        key={index}
                        onClick={() => insertTemplate(template.latex)}
                        className="cursor-pointer px-3 py-2 transition-colors hover:bg-neutral-50"
                      >
                        <span className="block font-medium text-neutral-700">{template.name}</span>
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
                  className="flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors outline-none hover:bg-neutral-300"
                >
                  <Sigma size={14} />
                  <span>Symbols</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showSymbols ? "rotate-180" : ""}`}
                  />
                </button>
                {showSymbols && (
                  <div className="nice-shadow absolute left-0 z-10 mt-1 w-64 rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-100 p-2 text-xs text-neutral-500">
                      Click to insert symbol
                    </div>
                    <div className="flex flex-wrap gap-1 p-2">
                      {mathSymbols.map((symbol, index) => (
                        <button
                          key={index}
                          onClick={() => insertSymbol(symbol.symbol)}
                          title={symbol.symbol}
                          className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-base text-neutral-700 transition-colors hover:bg-neutral-200"
                        >
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
                  className="flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors outline-none hover:bg-neutral-300"
                >
                  <Lightbulb size={14} />
                  <span>Help</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showHelp ? "rotate-180" : ""}`}
                  />
                </button>
                {showHelp && (
                  <div className="nice-shadow absolute left-0 z-10 mt-1 w-72 rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-100 p-2 text-xs font-medium text-neutral-700">
                      Quick Reference
                    </div>
                    <div className="space-y-2 p-3 text-xs text-neutral-600">
                      <div>
                        <span className="font-medium">Fractions:</span> \frac{"{"}num{"}"}
                        {"{"}denom{"}"}
                      </div>
                      <div>
                        <span className="font-medium">Exponents:</span> x^{"{"}power{"}"}
                      </div>
                      <div>
                        <span className="font-medium">Subscripts:</span> x_{"{"}subscript{"}"}
                      </div>
                      <div>
                        <span className="font-medium">Square root:</span> \sqrt{"{"}x{"}"}
                      </div>
                      <div className="border-t border-neutral-100 pt-2">
                        <a
                          className="flex items-center font-medium text-blue-600 hover:text-blue-800"
                          href="https://katex.org/docs/supported.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View full reference <ExternalLink size={10} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-1.5 transition-colors focus-within:border-neutral-300">
              <input
                ref={inputRef}
                value={equation}
                onChange={handleEquationChange}
                placeholder="Enter LaTeX equation..."
                type="text"
                className="flex-1 border-none bg-transparent px-3 py-2 text-sm text-neutral-700 placeholder-slate-400 outline-none"
              />
              <button
                onClick={saveEquation}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                <Save size={15} />
              </button>
            </div>

            <div className="flex items-center text-sm text-neutral-500">
              <span>Refer to the </span>
              <a
                className="mx-1 inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
                href="https://katex.org/docs/supported.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                KaTeX guide <ExternalLink size={12} className="ml-1" />
              </a>
              <span>for supported functions.</span>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default MathEquationBlockComponent;
