import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import DOMPurify from "dompurify";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CodeBlockComponent = ({ node, updateAttributes, extension }) => {
  const [copied, setCopied] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [language, setLanguage] = useState(node.attrs.language || "auto");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    try {
      updateAttributes({ language });
    } catch (error) {
      console.error("Error updating code block language:", error);
    }
  }, [language, updateAttributes]);

  const selectLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const copyCode = () => {
    const code = node.textContent;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  useEffect(() => {
    const updatePreviewContent = async () => {
      if (isPreviewMode) {
        if (language === "markdown") {
          const content = await marked(node.textContent);
          setPreviewContent(content);
        } else if (language === "html") {
          const content = DOMPurify.sanitize(node.textContent);
          setPreviewContent(content);
        }
      }
    };

    updatePreviewContent();
  }, [isPreviewMode, language, node.textContent]);

  const renderPreview = () => {
    if (isPreviewMode && previewContent) {
      return (
        <div
          className="prose dark:prose-invert bg-foreground/20 my-[1.5rem] max-w-none rounded-md px-[1rem] py-[.75rem]"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      );
    }
    return null;
  };

  return (
    <NodeViewWrapper className="group relative">
      {isPreviewMode && (language === "markdown" || language === "html") ? (
        renderPreview()
      ) : (
        <pre className="rounded-md">
          <NodeViewContent as="code" />
        </pre>
      )}
      <div
        className={`border-border bg-background absolute -top-[2.25rem] right-0 flex items-center space-x-4 rounded-md border px-1 transition-opacity duration-200 ${
          isSelectOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Select value={language} onValueChange={selectLanguage} onOpenChange={setIsSelectOpen}>
          <SelectTrigger className="bg-background h-fit w-fit border-none p-1 pr-4">
            <SelectValue placeholder="Language" className="mr-4" />
            <span className="w-2"></span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            {extension.options.lowlight.listLanguages().map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="bg-border flex h-5 w-[1px]"></div>
        {(language === "markdown" || language === "html") && (
          <Button
            variant="ghost"
            onClick={togglePreview}
            className="h-[1.5rem]"
            title={isPreviewMode ? "Show code" : `Preview ${language}`}
          >
            {isPreviewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        )}
        <div className="bg-border flex h-5 w-[1px]"></div>
        <Button variant="ghost" onClick={copyCode} className="h-fit p-[.35rem]">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
