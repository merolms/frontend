import { TipTapEditor } from "@/editor/TipTapEditor";

import { saveAs } from "file-saver";
import { marked } from "marked";
import TurndownService from "turndown";

import { useCurrentEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import "../editor.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BrainCircuit,
  CloudDownload,
  Download,
  X,
  FileDigit,
  Type,
  FileImage,
  Save,
  Underline as UnderlineIcon,
  Lock,
  LockOpen,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { createLowlight, all } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// import { FloatingMenu } from "./FloatingMenu";

// Create a lowlight instance
const lowlight = createLowlight(all);

// Register individual languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", javascript);
lowlight.register("javascript", javascript);
lowlight.register("ts", typescript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);

import {
  Bold,
  CodeXml,
  Italic,
  MessageSquareQuote,
  List,
  Minus,
  Strikethrough,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  SeparatorHorizontal,
  Code as CodeIcon,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Baseline,
  Highlighter,
  Link2,
  Eraser,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Alert } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getEncoding } from "js-tiktoken";
const enc = getEncoding("cl100k_base");

export const MenuBar = ({ initialDocument, initialReferences }) => {
  const [addRefContext, setAddRefContext] = useState(initialReferences);

  const { toast } = useToast();
  const { editor } = useCurrentEditor();
  const [userPrompt, setUserPrompt] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  //keep track of the cost from askai from input and output tokens
  //need to keep track of total input and output tokens as an array in cost state
  const [tokensAskAI, setTokensAskAI] = useState([]);

  // Calculate total cost
  const totalCost = tokensAskAI.reduce((acc, token) => {
    return acc + (token.inputTokens * 3 + token.outputTokens * 15) / 1000000;
  }, 0);

  const [includeFullDocument, setIncludeFullDocument] = useState(true);
  const [includeSelectedReferences, setIncludeSelectedReferences] = useState(true);

  const [isLoadingURL, setIsLoadingURL] = useState(false);
  const [isAskAiLoading, setIsAskAiLoading] = useState(false);

  const documentTokens = enc.encode(editor?.getHTML() ?? "").length;
  const selectedReferencesTokens = addRefContext.reduce((total, file) => total + file.tokens, 0);

  const [LLM_Model, setLLM_Model] = useState("llama3.1_70B");

  const [user, setUser] = useState(null);

  const [showLoginAlert, setShowLoginAlert] = useState(false);

  //set up saving in supabase
  const [isSaving, setIsSaving] = useState(false);
  const [document, setDocument] = useState({
    id: initialDocument?.id || "",
    title: initialDocument?.title || "Untitled Document",
    content: editor?.getHTML() || "",
    version: initialDocument?.version || 1,
    updated_at: initialDocument?.updated_at || new Date().toISOString(),
    created_at: initialDocument?.created_at || new Date().toISOString(),
    description: initialDocument?.description || null,
    file_size: initialDocument?.file_size || null,
    is_public: initialDocument?.is_public || false,
    mime_type: initialDocument?.mime_type || "text/html",
    storage_path: initialDocument?.storage_path || "",
    tags: initialDocument?.tags || [],
    user_id: initialDocument?.user_id || "",
  });

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // handle the save button click
  const handleSave = useCallback(async () => {});
  //   if (!editor) return

  // if (!user) {
  //   toast({
  //     title: "Oops",
  //     description: "No user found. Please sign in to save your document.",
  //     position: "bottom-right",
  //     variant: "destructive"
  //   })
  //   return
  // }

  // setIsSaving(true)
  // try {
  //   const content = editor.getHTML()
  //   let documentId = document.id
  //   let filePath

  //   if (documentId) {
  //     // Existing document
  //     filePath = document.storage_path
  //   } else {
  //     // New document: generate a UUID client-side
  //     documentId = crypto.randomUUID()
  //     filePath = `${user.id}/${documentId}.html`
  //   }

  //   // Fetch title, description, and tags from Groq API
  //   const response = await fetch("/api/groq/filename", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({ content })
  //   })

  //   if (!response.ok) {
  //     throw new Error("Failed to get metadata from Groq API")
  //   }

  //   const {
  //     title,
  //     description,
  //     tags,
  //     model,
  //     total_time,
  //     prompt_tokens,
  //     completion_tokens,
  //     prompt_time,
  //     completion_time
  //   } = await response.json()

  //   // Calculate tokens per second
  //   const inputTokensPerSecond = (prompt_tokens / prompt_time).toFixed(2)
  //   const outputTokensPerSecond = (
  //     completion_tokens / completion_time
  //   ).toFixed(2)

  //   // Upload content to Supabase Storage
  //   const { error: storageError } = await supabase.storage
  //     .from("wysiwyg-documents")
  //     .upload(filePath, content, {
  //       contentType: "text/html",
  //       upsert: true
  //     })

  //   if (storageError) throw storageError

  //   let documentData

  //   if (document.id) {
  //     // Update existing document
  //     const { data, error: documentError } = await supabase
  //       .from("wysiwyg_documents")
  //       .update({
  //         title: title || document.title,
  //         description: description || document.description,
  //         tags: tags || document.tags,
  //         storage_path: filePath,
  //         version: (document.version ?? 0) + 1,
  //         mime_type: "text/html",
  //         file_size: new Blob([content]).size
  //       })
  //       .eq("id", documentId)
  //       .select()
  //       .single()

  //     if (documentError) throw documentError
  //     documentData = data
  //   } else {
  //     // Insert new document
  //     const { data, error: documentError } = await supabase
  //       .from("wysiwyg_documents")
  //       .insert({
  //         id: documentId, // Use the generated UUID
  //         title: title || document.title,
  //         description: description || document.description,
  //         tags: tags || document.tags,
  //         user_id: user.id,
  //         storage_path: filePath,
  //         is_public: false,
  //         mime_type: "text/html",
  //         file_size: new Blob([content]).size
  //       })
  //       .select()
  //       .single()

  //     if (documentError) throw documentError
  //     documentData = data
  //   }

  //   // Save references
  //   const savedReferences = await saveReferences(addRefContext, documentId)

  //   setDocument({
  //     id: documentData.id,
  //     title: documentData.title,
  //     content,
  //     version: documentData.version,
  //     updated_at: documentData.updated_at,
  //     created_at: documentData.created_at,
  //     description: documentData.description,
  //     file_size: documentData.file_size,
  //     is_public: documentData.is_public,
  //     mime_type: documentData.mime_type,
  //     storage_path: documentData.storage_path,
  //     user_id: documentData.user_id,
  //     tags: documentData.tags || []
  //   })

  //   toast({
  //     title: "Document saved",
  //     description: `The document has been ${
  //       document.id ? "updated" : "saved"
  //     } with ${
  //       savedReferences.length
  //     } references. 🚀 Model: ${model}, Response Time: ${total_time.toFixed(
  //       2
  //     )}s ⚡\nInput Tokens/s: ${inputTokensPerSecond} ⏱️\nOutput Tokens/s: ${outputTokensPerSecond} ⏱️`,
  //     position: "bottom-right"
  //   })
  // } catch (error) {
  //   console.error("Error saving document:", error)
  //   toast({
  //     title: "Error",
  //     description: "Failed to save document. Please try again.",
  //     position: "bottom-right",
  //     variant: "destructive"
  //   })
  // } finally {
  //     setIsSaving(false)
  //   // }
  // }, [editor, user, document, addRefContext])

  // Function to save references
  const saveReferences = async (references, documentId) => {
    const savedRefs = [];

    // for (const ref of references) {
    //   try {
    //     // Generate a consistent filename with a timestamp
    //     const timestamp = Date.now()
    //     const fileName = `${
    //       ref.name.split(".")[0]
    //     }-${timestamp}.${ref.name.split(".").pop()}`

    //     // Generate the file path
    //     const filePath = `${user?.id}/references/${fileName}`

    //     // Upload or update file in Supabase Storage
    //     const { error: storageError } = await supabase.storage
    //       .from("wysiwyg-documents")
    //       .upload(filePath, ref.text, {
    //         contentType: ref.mime_type || undefined,
    //         upsert: true
    //       })

    //     if (storageError) throw storageError

    //     // Use the same filePath for database operations
    //     const { data: existingRef, error: existingRefError } = await supabase
    //       .from("wysiwyg_references")
    //       .select()
    //       .eq("user_id", user?.id ?? "")
    //       .eq("storage_path", filePath) // Use filePath instead of ref.storage_path
    //       .single()

    //     if (existingRefError && existingRefError.code !== "PGRST116") {
    //       console.error("Error checking existing reference:", existingRefError)
    //       continue
    //     }

    //     let refData

    //     if (existingRef) {
    //       // Update existing reference
    //       const { data, error: updateError } = await supabase
    //         .from("wysiwyg_references")
    //         .update({
    //           title: ref.title,
    //           description: ref.description || null,
    //           mime_type: ref.mime_type || null,
    //           file_size: ref.file_size || null,
    //           storage_path: filePath // Update storage_path
    //         })
    //         .eq("id", existingRef.id)
    //         .select()

    //       if (updateError) throw updateError
    //       refData = data?.[0]
    //     } else {
    //       // Create new reference
    //       const { data, error: insertError } = await supabase
    //         .from("wysiwyg_references")
    //         .insert({
    //           title: ref.title,
    //           description: ref.description || null,
    //           user_id: user?.id || "",
    //           storage_path: filePath, // Use the new filePath
    //           mime_type: ref.mime_type || null,
    //           file_size: ref.file_size || null
    //         })
    //         .select()

    //       if (insertError) throw insertError
    //       refData = data?.[0]
    //     }

    //     // Create or update mapping
    //     const { error: mappingError } = await supabase
    //       .from("wysiwyg_document_reference_mappings")
    //       .upsert(
    //         {
    //           document_id: documentId,
    //           reference_id: refData.id
    //         },
    //         {
    //           onConflict: "document_id,reference_id"
    //         }
    //       )

    //     if (mappingError) throw mappingError

    //     savedRefs.push(refData)
    //   } catch (error) {
    //     console.error("Error saving reference:", error)
    //   }
    // }

    return savedRefs;
  };

  //handle the share button click
  const handleShare = useCallback(async () => {});
  //   if (!user) {
  //     toast({
  //       title: "Login Required",
  //       description: "You must be logged in to share documents.",
  //       position: "bottom-right",
  //       variant: "destructive"
  //     })
  //     return
  //   }

  //   if (!document.id) {
  //     toast({
  //       title: "Save Required",
  //       description: "Please save your document before sharing.",
  //       position: "bottom-right",
  //       variant: "destructive"
  //     })
  //     return
  //   }

  //   try {
  //     const newIsPublic = !document.is_public

  //     const { data, error } = await supabase
  //       .from("wysiwyg_documents")
  //       .update({ is_public: newIsPublic })
  //       .eq("id", document.id)
  //       .select()
  //       .single()

  //     if (error) throw error

  //     // Update local state
  //     setDocument({ ...document, is_public: newIsPublic })

  //     // Generate share URL and open dialog
  //     if (newIsPublic) {
  //       const shareLink = `${window.location.origin}/published?documentId=${document.id}`
  //       setShareUrl(shareLink)
  //       setShareDialogOpen(true)
  //     }

  //     toast({
  //       title: newIsPublic ? "Document shared" : "Document unshared",
  //       description: newIsPublic
  //         ? "Your document is now publicly accessible."
  //         : "Your document is now private.",
  //       position: "bottom-right"
  //     })
  //   } catch (error) {
  //     console.error("Error updating document:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to update sharing settings.",
  //       position: "bottom-right",
  //       variant: "destructive"
  //     })
  //   }
  // }, [user, document, supabase, toast])

  const copyShareLink = () => {};
  //   navigator.clipboard.writeText(shareUrl)
  //   toast({
  //     title: "Link copied",
  //     description: "Share link copied to clipboard",
  //     position: "bottom-right"
  //   })
  // }

  const addImage = useCallback(() => {});
  //   if (editor) {
  //     const url = ""
  //     const title = ""
  //     editor
  //       .chain()
  //       .focus()
  //       .setResizableImage({
  //         src: url,
  //         title: title
  //       })
  //       .run()
  //   }
  // }, [editor])

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const {
  //       data: { user },
  //       error
  //     } = await supabase.auth.getUser()
  //     if (error) {
  //       console.error("Error fetching user:", error)
  //     } else {
  //       setUser(user)
  //     }
  //   }

  //   fetchUser()
  // }, [])

  // const handleFileClick = file => {
  //   setSelectedFile(file)
  // }

  const onDrop = useCallback((acceptedFiles) => {});
  //   acceptedFiles.forEach(file => {
  //     const reader = new FileReader()
  //     reader.onload = async event => {
  //       const fileContent = event.target?.result
  //       const tokens = enc.encode(fileContent).length

  //       // Fetch the title from the groq/filename route
  //       const response = await fetch("/api/groq/filename", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({ content: fileContent })
  //       })
  //       const data = await response.json()

  //       setAddRefContext(prevFiles => [
  //         ...prevFiles,
  //         {
  //           id: crypto.randomUUID(), // Generate a new UUID for the file
  //           name: file.name,
  //           title: data.title, // Use the title from the API response
  //           description: null, // You might want to generate a description
  //           user_id: user?.id || "", // Make sure to handle the case where user is not defined
  //           storage_path: `${user?.id}/references/${file.name}`,
  //           mime_type: file.type,
  //           file_size: file.size,
  //           created_at: new Date().toISOString(),
  //           updated_at: new Date().toISOString(),
  //           text: fileContent,
  //           tokens: tokens,
  //           lastModified: file.lastModified
  //         }
  //       ])
  //     }
  //     reader.readAsText(file)
  //   })
  // }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // const handleFileDelete = useCallback(
  //   async fileToDelete => {
  //     // First, remove the file from the local state
  //     setAddRefContext(prevFiles =>
  //       prevFiles.filter(file => file.id !== fileToDelete.id)
  //     )

  //     if (selectedFile && selectedFile.id === fileToDelete.id) {
  //       setSelectedFile(null)
  //     }

  //   // Then, delete the file from Supabase
  //   try {
  //     console.log("Deleting file:", fileToDelete.storage_path)
  //     // Delete the file from storage
  //     const { error: storageError } = await supabase.storage
  //       .from("wysiwyg-documents")
  //       .remove([fileToDelete.storage_path])

  //     if (storageError) {
  //       console.error("Error deleting file from storage:", storageError)
  //       throw storageError
  //     }

  //     // Delete the reference from the database
  //     const { error: dbError } = await supabase
  //       .from("wysiwyg_references")
  //       .delete()
  //       .eq("id", fileToDelete.id)

  //     if (dbError) {
  //       console.error("Error deleting reference from database:", dbError)
  //       throw dbError
  //     }

  //     // Delete the mapping if it exists
  //     if (document.id) {
  //       const { error: mappingError } = await supabase
  //         .from("wysiwyg_document_reference_mappings")
  //         .delete()
  //         .eq("document_id", document.id)
  //         .eq("reference_id", fileToDelete.id)

  //       if (mappingError) {
  //         console.error("Error deleting mapping:", mappingError)
  //         // We don't throw here as it's not critical if the mapping deletion fails
  //       }
  //     }

  //     toast({
  //       title: "Reference deleted",
  //       description: "The reference has been successfully deleted.",
  //       position: "bottom-right"
  //     })
  //   } catch (error) {
  //     console.error("Error deleting reference:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete reference. Please try again.",
  //       position: "bottom-right",
  //       variant: "destructive"
  //     })
  //   }
  // },
  // [selectedFile, document.id, supabase, toast]
  // )

  const setLink = useCallback(() => {});
  //   if (!editor) {
  //     return null
  //   }

  //   const previousUrl = editor.getAttributes("link").href
  //   const url = window.prompt("URL", previousUrl)

  //   // cancelled
  //   if (url === null) {
  //     return
  //   }

  //   // empty
  //   if (url === "") {
  //     editor
  //       .chain()
  //       .focus()
  //       .extendMarkRange("link")
  //       .unsetLink()
  //       .run()

  //     return
  //   }

  //   // update link
  //   editor
  //     .chain()
  //     .focus()
  //     .extendMarkRange("link")
  //     .setLink({ href: url })
  //     .run()
  // }, [editor])

  // if (!editor) {
  //   return null
  // }

  // const getProposedFileName = async content => {
  //   try {
  //     const response = await fetch("/api/groq/filename", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({ content })
  //     })

  //     if (!response.ok) {
  //       throw new Error("Failed to get proposed file name")
  //     }

  //     const data = await response.json()
  //     return data.title || "editor-content.txt"
  //   } catch (error) {
  //     console.error("Error getting proposed file name:", error)
  //     return "editor-content.txt"
  //   }
  // }

  const handleDownloadTxt = async () => {};
  //   const content = editor.getText()
  //   const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  //   const proposedFileName = await getProposedFileName(content)
  //   saveAs(blob, proposedFileName)
  // }

  const handleDownloadHTML = async () => {};
  //   const content = editor.getHTML()
  //   const blob = new Blob([content], { type: "text/html;charset=utf-8" })
  //   const proposedFileName = await getProposedFileName(editor.getText())
  //   saveAs(blob, proposedFileName)
  // }

  const handleDownloadMD = async () => {};
  //   const htmlContent = editor.getHTML()

  //   // Convert HTML to Markdown using turndown
  //   const turndownService = new TurndownService()
  //   const markdown = turndownService.turndown(htmlContent)

  //   const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
  //   const proposedFileName = await getProposedFileName(editor.getText())
  //   saveAs(blob, proposedFileName.replace(/\.[^/.]+$/, "") + ".md")
  // }

  // const handleUrlSubmit = async url => {
  //   setIsLoadingURL(true)
  //   toast({
  //     title: "Sending URL to JinaAI",
  //     description: "Please wait...",
  //     position: "bottom-right"
  //   })

  //   // Add a skeleton placeholder
  //   const skeletonFile = {
  //     id: `loading-${Date.now()}`,
  //     name: `loading-${Date.now()}.md`,
  //     title: "Loading...",
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //     lastModified: Date.now(),
  //     file_size: 0,
  //     mime_type: "text/markdown",
  //     user_id: user?.id || "",
  //     description: "Loading content...",
  //     storage_path: "",
  //     text: null,
  //     tokens: 0
  //   }
  //   setAddRefContext(prevFiles => [...prevFiles, skeletonFile])

  //   try {
  //     const response = await fetch("/api/jinaai", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({ url })
  //     })

  //     if (!response.ok) {
  //       throw new Error("Network response was not ok")
  //     }

  //     const reader = response.body?.getReader()
  //     if (!reader) {
  //       throw new Error("Failed to get reader from response")
  //     }

  //     let buffer = ""
  //     let finalContent = ""

  //     while (true) {
  //       const { done, value } = await reader.read()
  //       if (done) break

  //       const chunk = new TextDecoder().decode(value)
  //       const lines = chunk.split("\n")

  //       for (const line of lines) {
  //         if (line.startsWith("data: ")) {
  //           const data = line.slice(6).trim()
  //           if (data === "[DONE]") {
  //             console.log("Stream completed")
  //             break
  //           }

  //           buffer += data

  //           try {
  //             const parsedData = JSON.parse(buffer)

  //             if (parsedData.type === "result") {
  //               const markdownContent = parsedData.message
  //               const htmlContent = await marked.parse(markdownContent)
  //               finalContent += htmlContent // Append to finalContent instead of overwriting
  //             }

  //             buffer = "" // Clear buffer after successful parse
  //           } catch (parseError) {
  //             if (parseError instanceof SyntaxError) {
  //               console.log("Incomplete JSON, continuing to buffer")
  //               // Continue buffering as this might be an incomplete JSON object
  //             } else {
  //               console.error("Unexpected error parsing JSON:", parseError)
  //               buffer = "" // Clear buffer on unexpected errors
  //             }
  //           }
  //         }
  //       }
  //     }

  //     console.log("Final content:", finalContent)

  //     const responseFileTitle = await fetch("/api/groq/filename", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({ content: finalContent })
  //     })
  //     const titleData = await responseFileTitle.json()
  //     console.log("titleData", titleData)

  //     // Generate a consistent filename with a timestamp
  //     const timestamp = Date.now()
  //     const fileName = `${new URL(url).hostname}-${timestamp}.md`

  //     // Generate the file path
  //     const filePath = `${user?.id}/references/${fileName}`

  //     // Create a new file-like object from the received content
  //     const newFile = {
  //       id: crypto.randomUUID(), // Generate a new UUID for the file
  //       title: titleData.title,
  //       description: null, // You might want to generate a description
  //       user_id: user?.id || "", // Make sure to handle the case where user is not defined
  //       storage_path: filePath, // Use the consistent file path
  //       mime_type: "text/markdown",
  //       file_size: new Blob([finalContent]).size,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       // Additional fields for FileWithContent
  //       name: fileName,
  //       text: finalContent,
  //       tokens: enc.encode(finalContent).length,
  //       lastModified: timestamp,
  //       url: url
  //     }

  //     // Remove the skeleton and add the actual file
  //     setAddRefContext(prevFiles => [
  //       ...prevFiles.filter(file => file.name !== skeletonFile.name),
  //       newFile
  //     ])

  //     toast({
  //       title: "Content retrieved",
  //       description: "The content has been added to your references.",
  //       position: "bottom-right"
  //     })
  //   } catch (error) {
  //     console.error("Error submitting URL:", error)
  //     // Remove the skeleton on error
  //     setAddRefContext(prevFiles =>
  //       prevFiles.filter(file => file.name !== skeletonFile.name)
  //     )
  //     toast({
  //       title: "Error",
  //       description: "Failed to process URL. Please try again.",
  //       position: "bottom-right",
  //       variant: "destructive"
  //     })
  //   } finally {
  //     setIsLoadingURL(false)
  //   }
  // }

  // const askAi = async () => {
  //   setIsAskAiLoading(true)

  //   //toast message for submitting to AI
  //   toast({
  //     title: "Submitting to AskAI",
  //     description: "Please wait...",
  //     position: "bottom-right"
  //   })

  //   // Prepare the request body
  //   const requestBody = {
  //     userPrompt: userPrompt
  //   }

  //   // Include docContext only if includeFullDocument is true
  //   if (includeFullDocument) {
  //     requestBody.docContext = editor.getHTML()
  //   }

  //   // Include addRefContext only if includeSelectedReferences is true
  //   if (includeSelectedReferences) {
  //     requestBody.addRefContext = addRefContext
  //   }

  //   // Determine the API route based on the selected LLM model
  //   const apiRoute =
  //     LLM_Model === "sonnet_3.5" ? "/api/anthropic" : "/api/groq/chat"

  //   try {
  //     const response = await fetch(apiRoute, {
  //       // Use the determined API route
  //       method: "POST",
  //       body: JSON.stringify(requestBody)
  //     })
  //     const data = await response.json()

  //     toast({
  //       title: "Cost",
  //       description: `Input Tokens: ${(data.usage.inputTokens * 3) /
  //         1000000} Output Tokens: ${(data.usage.outputTokens * 15) / 1000000}`,
  //       position: "bottom-right"
  //     })

  //     setTokensAskAI(prevTokens => [
  //       ...prevTokens,
  //       {
  //         inputTokens: data.usage.inputTokens,
  //         outputTokens: data.usage.outputTokens
  //       }
  //     ])

  //     const markdownContent = data.message
  //     let htmlContent

  //     // Check if the content is a code block
  //     if (
  //       markdownContent.startsWith("```") &&
  //       markdownContent.endsWith("```")
  //     ) {
  //       // It's a code block, so we'll use the syntax highlighter
  //       const codeContent = markdownContent.slice(3, -3).trim()
  //       htmlContent = `<pre><code>${codeContent}</code></pre>`
  //     } else {
  //       // It's not a code block, so we'll parse it as regular markdown
  //       htmlContent = await marked.parse(markdownContent)
  //     }

  //     // Get the current cursor position
  //     const currentPos = editor.state.selection.from

  //     // Insert the AI response content
  //     editor
  //       .chain()
  //       .focus()
  //       .insertContent(htmlContent)
  //       .run()

  //     // Calculate the end position of the inserted content
  //     const endPos = currentPos + data.message.length

  //     // Select the newly inserted content
  //     editor.commands.setTextSelection({ from: currentPos, to: endPos })
  //   } catch (error) {
  //     console.log("Error in askAi:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to get AI response. Please try again.",
  //       position: "bottom-right",
  //       variant: "destructive"
  //     })
  //   } finally {
  //     setIsAskAiLoading(false)
  //   }
  // }

  return (
    <div className="bg-background sticky top-0 z-50 py-2">
      {/* Menu Bar */}
      <div className="flex w-full flex-row justify-between">
        <div className="flex flex-row flex-wrap gap-2">
          {/* formatting like paragraph, heading, list, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="m-0 h-fit w-fit p-[.35rem]">
                  {editor.isActive("taskList") ? (
                    <ListTodo className="h-5 w-5 flex-none" />
                  ) : editor.isActive("orderedList") ? (
                    <ListOrdered className="h-5 w-5 flex-none" />
                  ) : editor.isActive("bulletList") ? (
                    <List className="h-5 w-5 flex-none" />
                  ) : editor.isActive("code") ? (
                    <CodeIcon className="h-5 w-5 flex-none" />
                  ) : editor.isActive("codeBlock") ? (
                    <CodeXml className="h-5 w-5 flex-none" />
                  ) : editor.isActive("blockquote") ? (
                    <MessageSquareQuote className="h-5 w-5 flex-none" />
                  ) : editor.isActive("heading", { level: 3 }) ? (
                    <Heading3 className="h-5 w-5 flex-none" />
                  ) : editor.isActive("heading", { level: 2 }) ? (
                    <Heading2 className="h-5 w-5 flex-none" />
                  ) : editor.isActive("heading", { level: 1 }) ? (
                    <Heading1 className="h-5 w-5 flex-none" />
                  ) : editor.isActive("paragraph") ? (
                    <Type className="h-5 w-5 flex-none" />
                  ) : (
                    <Type className="h-5 w-5 flex-none" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="m-0 mt-2 flex h-fit w-fit flex-col items-start justify-start gap-2 p-2"
                align="start"
              >
                <ToggleGroup
                  type="single"
                  value={
                    editor.isActive("taskList")
                      ? "taskList"
                      : editor.isActive("orderedList")
                        ? "orderedList"
                        : editor.isActive("bulletList")
                          ? "bulletList"
                          : editor.isActive("code")
                            ? "code"
                            : editor.isActive("codeBlock")
                              ? "codeBlock"
                              : editor.isActive("blockquote")
                                ? "blockquote"
                                : editor.isActive("heading", { level: 3 })
                                  ? "heading3"
                                  : editor.isActive("heading", { level: 2 })
                                    ? "heading2"
                                    : editor.isActive("heading", { level: 1 })
                                      ? "heading1"
                                      : editor.isActive("paragraph")
                                        ? "paragraph"
                                        : ""
                  }
                  className="flex flex-col items-start justify-start gap-1"
                >
                  <div className="flex flex-col items-start justify-start gap-1">
                    <div className="text-muted-foreground text-sm">Text</div>
                    <div className="flex flex-row items-start justify-start gap-1">
                      <ToggleGroupItem
                        value="paragraph"
                        aria-label="Paragraph"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().setParagraph().run()}
                      >
                        <Type className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="heading1"
                        aria-label="Heading 1"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      >
                        <Heading1 className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="heading2"
                        aria-label="Heading 2"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      >
                        <Heading2 className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="heading3"
                        aria-label="Heading 3"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      >
                        <Heading3 className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="my-2 flex w-full" />
                  <div className="flex flex-col items-start justify-start gap-1">
                    <div className="text-muted-foreground text-sm">List</div>
                    <div className="flex flex-row items-start justify-start gap-1">
                      <ToggleGroupItem
                        value="bulletList"
                        aria-label="Bullet List"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                      >
                        <List className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="orderedList"
                        aria-label="Ordered List"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      >
                        <ListOrdered className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="taskList"
                        aria-label="Task List"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                      >
                        <ListTodo className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="my-2 flex w-full" />
                  <div className="flex flex-col items-start justify-start gap-1">
                    <div className="text-muted-foreground text-sm"></div>
                    <div className="flex flex-row items-start justify-start gap-1">
                      <ToggleGroupItem
                        value="code"
                        aria-label="Code"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                      >
                        <CodeIcon className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="codeBlock"
                        aria-label="Code Block"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                      >
                        <CodeXml className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="blockquote"
                        aria-label="Blockquote"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      >
                        <MessageSquareQuote className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="my-2 flex w-full" />
                  <div className="flex flex-col items-start justify-start gap-1">
                    <div className="text-muted-foreground text-sm">Media</div>
                    <div className="flex flex-row items-start justify-start gap-1">
                      <ToggleGroupItem
                        value="addImage"
                        aria-label="Add Image"
                        className="m-0 h-fit w-fit p-[.35rem]"
                        onClick={addImage}
                      >
                        <FileImage className="h-5 w-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="my-2 flex w-full" />
                  <div className="flex flex-col items-start justify-start gap-1">
                    <div className="text-muted-foreground text-sm">Seperator</div>
                    <div className="flex flex-row items-start justify-start gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className="m-0 h-fit w-fit p-[.35rem]"
                      >
                        <Minus className="h-5 w-5 flex-none" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => editor.chain().focus().setHardBreak().run()}
                        className="m-0 h-fit w-fit p-[.35rem]"
                      >
                        <SeparatorHorizontal className="h-5 w-5 flex-none" />
                      </Button>
                    </div>
                  </div>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* alignment like left, center, right, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="m-0 h-fit w-fit p-[.35rem]">
                  {editor.isActive({ textAlign: "left" }) ? (
                    <AlignLeft className="h-5 w-5 flex-none" />
                  ) : editor.isActive({ textAlign: "center" }) ? (
                    <AlignCenter className="h-5 w-5 flex-none" />
                  ) : (
                    <AlignRight className="h-5 w-5 flex-none" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
                <ToggleGroup
                  type="single"
                  value={
                    editor.isActive({ textAlign: "left" })
                      ? "left"
                      : editor.isActive({ textAlign: "center" })
                        ? "center"
                        : "right"
                  }
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="left"
                    aria-label="Left Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignLeft className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="center"
                    aria-label="Center Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignCenter className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="right"
                    aria-label="Right Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignRight className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* styles like bold, italic, strikethrough, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Toggle
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              pressed={editor.isActive("bold")}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Bold className="h-5 w-5 flex-none" />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              pressed={editor.isActive("italic")}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Italic className="h-5 w-5 flex-none" />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              pressed={editor.isActive("underline")}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <UnderlineIcon className="h-5 w-5 flex-none" />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              pressed={editor.isActive("strike")}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Strikethrough className="h-5 w-5 flex-none" />
            </Toggle>

            <Toggle
              onClick={setLink}
              pressed={editor.isActive("link")}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Link2 className="h-5 w-5 flex-none" />
            </Toggle>
            {/* <Toggle
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive("link")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Link2Off className="w-5 h-5 flex-none" />
            </Toggle> */}
          </Alert>

          {/* horizontal rule */}
          <Alert className="m-0 flex w-fit flex-row gap-1 p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]">
                  <Baseline
                    className="h-5 w-5 flex-none"
                    style={{
                      color: editor.getAttributes("textStyle").color,
                    }}
                  ></Baseline>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
                <ToggleGroup
                  type="single"
                  value={editor.getAttributes("textStyle").color}
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="#e11d48"
                    aria-label="toggle rose"
                    onClick={() => editor.chain().focus().setColor("#e11d48").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#e11d48" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#7c3aed"
                    aria-label="toggle violet"
                    onClick={() => editor.chain().focus().setColor("#7c3aed").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#7c3aed" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#2563eb"
                    aria-label="toggle blue"
                    onClick={() => editor.chain().focus().setColor("#2563eb").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#10b981"
                    aria-label="toggle emerald"
                    onClick={() => editor.chain().focus().setColor("#10b981").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#f59e0b"
                    aria-label="toggle amber"
                    onClick={() => editor.chain().focus().setColor("#f59e0b").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#737373"
                    aria-label="toggle neutral"
                    onClick={() => editor.chain().focus().setColor("#737373").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#737373" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#fafafa"
                    aria-label="toggle white"
                    onClick={() => editor.chain().focus().setColor("#fafafa").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#fafafa" }}
                    ></div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
            {/* highlight */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="m-0 h-fit w-fit p-[.35rem]"
                  style={{
                    color: editor.getAttributes("highlight").color,
                  }}
                >
                  <Highlighter className="h-5 w-5 flex-none" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
                <ToggleGroup
                  type="single"
                  value={editor.getAttributes("highlight").color}
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="#e11d48"
                    aria-label="toggle rose highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#e11d48" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#e11d48" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#7c3aed"
                    aria-label="toggle violet highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#7c3aed" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#7c3aed" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#2563eb"
                    aria-label="toggle blue highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#2563eb" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#10b981"
                    aria-label="toggle emerald highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#10b981" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#f59e0b"
                    aria-label="toggle amber highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#f59e0b" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#737373"
                    aria-label="toggle neutral highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#737373" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#737373" }}
                    ></div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* other like unset all marks, clear nodes, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Eraser className="h-5 w-5 flex-none" />
            </Button>
          </Alert>

          {/* undo, redo, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Undo2 className="h-5 w-5 flex-none" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Redo2 className="h-5 w-5 flex-none" />
            </Button>
          </Alert>
        </div>

        <div className="flex flex-row flex-wrap gap-2 sm:items-end sm:justify-end">
          {/* Words and Char Counts */}
          <Alert className="m-0 hidden h-fit w-fit flex-row gap-1 p-1 px-2 sm:flex">
            <div className="text-muted-foreground text-xs">
              {editor.storage.characterCount.words()} words
              <br />
              {editor.storage.characterCount.characters()} chars
            </div>
          </Alert>

          {/* Download as different formats */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]">
                  <Download className="h-5 w-5 flex-none"></Download>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 flex h-fit w-fit flex-col gap-1 p-1" align="end">
                <Button
                  variant="ghost"
                  className="h-fit w-full items-start justify-between px-2 py-1 text-left"
                  onClick={handleDownloadTxt}
                >
                  <p>Plain Text</p>{" "}
                  <Badge variant="outline" className="ml-2">
                    .txt
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="h-fit w-full items-start justify-between px-2 py-1 text-left"
                  onClick={handleDownloadMD}
                >
                  <p>Markdown</p>{" "}
                  <Badge variant="outline" className="ml-2">
                    .md
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="h-fit w-full items-start justify-between px-2 py-1 text-left"
                  onClick={handleDownloadHTML}
                >
                  <p>Web Page</p>{" "}
                  <Badge variant="outline" className="ml-2">
                    .html
                  </Badge>
                </Button>
              </PopoverContent>
            </Popover>
            {/* save button */}
            <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]" onClick={handleSave}>
              <Save className="h-5 w-5 flex-none" />
            </Button>

            {/* Share button */}
            <>
              <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]" onClick={handleShare}>
                {document.is_public ? (
                  <LockOpen className="h-5 w-5 flex-none text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-5 w-5 flex-none text-red-600 dark:text-red-400" />
                )}
              </Button>

              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                      Anyone with this link will be able to view this document.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input id="link" value={shareUrl} readOnly />
                    </div>
                    <Button type="button" size="sm" className="px-3" onClick={copyShareLink}>
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          </Alert>
        </div>

        {/* floating menu */}
        {/* {editor && <FloatingMenu editor={editor} />} */}
      </div>
    </div>
  );
};
