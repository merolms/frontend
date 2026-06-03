"use client";
import React, { useState, useCallback } from "react";
// import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react"
import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react/menus";

import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { CircleCheckBig, Circle, FileDigit, BrainCircuit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getEncoding } from "js-tiktoken";
import { marked } from "marked";

export const FloatingMenu = ({ editor }) => {
  const { toast } = useToast();
  const [userPrompt, setUserPrompt] = useState("");
  const [includeFullDocument, setIncludeFullDocument] = useState(true);
  const [includeSelectedReferences, setIncludeSelectedReferences] = useState(true);
  const [isAskAiLoading, setIsAskAiLoading] = useState(false);
  const [tokensAskAI, setTokensAskAI] = useState([]);

  const enc = getEncoding("cl100k_base");
  const documentTokens = enc.encode(editor.getHTML() ?? "").length;
  const selectedReferencesTokens = 0; // You might need to implement this based on your references logic

  const askAi = useCallback(async () => {
    setIsAskAiLoading(true);

    toast({
      title: "Submitting to AskAI",
      description: "Please wait...",
      position: "bottom-right",
    });

    const requestBody = {
      userPrompt: userPrompt,
    };

    if (includeFullDocument) {
      requestBody.docContext = editor.getHTML();
    }

    if (includeSelectedReferences) {
      // Implement this based on your references logic
      requestBody.addRefContext = [];
    }

    try {
      const response = await fetch("/api/groq/chat", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      toast({
        title: "Cost",
        description: `Input Tokens: ${
          (data.usage.inputTokens * 3) / 1000000
        } Output Tokens: ${(data.usage.outputTokens * 15) / 1000000}`,
        position: "bottom-right",
      });

      setTokensAskAI((prevTokens) => [
        ...prevTokens,
        {
          inputTokens: data.usage.inputTokens,
          outputTokens: data.usage.outputTokens,
        },
      ]);

      const markdownContent = data.message;
      let htmlContent;

      if (markdownContent.startsWith("```") && markdownContent.endsWith("```")) {
        const codeContent = markdownContent.slice(3, -3).trim();
        htmlContent = `<pre><code>${codeContent}</code></pre>`;
      } else {
        htmlContent = await marked.parse(markdownContent);
      }

      const currentPos = editor.state.selection.from;
      editor.chain().focus().insertContent(htmlContent).run();
      const endPos = currentPos + data.message.length;
      editor.commands.setTextSelection({ from: currentPos, to: endPos });
    } catch (error) {
      console.error("Error in askAi:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        position: "bottom-right",
        variant: "destructive",
      });
    } finally {
      setIsAskAiLoading(false);
    }
  }, [editor, userPrompt, includeFullDocument, includeSelectedReferences, toast]);

  return (
    <TiptapFloatingMenu
      className="floating-menu mt-[10rem] ml-[1rem] w-fit items-start justify-start"
      tippyOptions={{ duration: 100 }}
      editor={editor}
    >
      <Alert className="relative flex flex-col gap-2 p-2">
        <Textarea
          placeholder="Ask AI"
          className="h-[3rem] w-[300px] pr-[6rem] sm:w-[500px]"
          value={userPrompt}
          disabled={isAskAiLoading}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
        <Button
          variant="outline"
          className="absolute top-[1rem] right-[1rem]"
          onClick={askAi}
          disabled={isAskAiLoading}
        >
          {isAskAiLoading ? (
            <span
              className="loader"
              style={{
                "--loader-size": "18px",
                "--loader-color": "#000",
                "--loader-color-dark": "#fff",
              }}
            ></span>
          ) : (
            "Create"
          )}
        </Button>
        <div className="flex flex-row gap-2">
          <Toggle
            variant="outline"
            defaultPressed={true}
            pressed={includeFullDocument}
            onPressedChange={setIncludeFullDocument}
            className={`flex h-fit flex-row gap-2 py-1 ${
              !includeFullDocument ? "text-muted-foreground" : ""
            }`}
          >
            {includeFullDocument ? (
              <CircleCheckBig className="h-4 w-4 flex-none" />
            ) : (
              <Circle className="text-muted-foreground h-4 w-4 flex-none" />
            )}
            <div className="flex flex-row items-center text-left">
              <div className="">
                <FileDigit className="mr-2 h-4 w-4 flex-none" />
              </div>
              <div className="">{documentTokens} Tokens</div>
            </div>
          </Toggle>
          <Toggle
            variant="outline"
            defaultPressed={true}
            pressed={includeSelectedReferences}
            onPressedChange={setIncludeSelectedReferences}
            className={`flex h-fit flex-row gap-2 py-1 ${
              !includeSelectedReferences ? "text-muted-foreground" : ""
            }`}
          >
            {includeSelectedReferences ? (
              <CircleCheckBig className="h-4 w-4 flex-none" />
            ) : (
              <Circle className="text-muted-foreground h-4 w-4 flex-none" />
            )}
            <div className="flex flex-row items-center text-left">
              <div className="">
                <BrainCircuit className="mr-2 h-4 w-4 flex-none" />
              </div>
              <div className="">{selectedReferencesTokens} tokens</div>
            </div>
          </Toggle>
        </div>
      </Alert>
    </TiptapFloatingMenu>
  );
};
