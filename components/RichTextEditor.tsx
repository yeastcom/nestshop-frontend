"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Textarea } from "@/components/ui/textarea"
import {
  IconList,
  IconListNumbers
} from "@tabler/icons-react"
type Props = {
  value?: string; // HTML
  onChange?: (html: string) => void;
  editable?: boolean;
};

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // klik w tło zamyka
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "min(900px, 100%)",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "rgb(18, 18, 18)"

        }}
        className={"richTextEditor border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border"}

      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <strong>{title}</strong>
          <button type="button" onClick={onClose} aria-label="Zamknij">
            ✕
          </button>
        </div>
        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}

function Toolbar({
  editor,
  onOpenHtml,
}: {
  editor: any;
  onOpenHtml: () => void;
}) {
  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Wklej URL", prev || "");
    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim(), target: "_blank", rel: "noopener noreferrer" })
      .run();
  };

  const Btn = useMemo(
    () =>
      function Btn({
        children,
        onClick,
        active,
        title,
      }: {
        children: React.ReactNode;
        onClick: () => void;
        active?: boolean;
        title?: string;
      }) {
        return (
          <button
            type="button"
            title={title}
            onClick={onClick}
            aria-pressed={!!active}
     
          >
            {children}
          </button>
        );
      },
    []
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        padding: 10,
        borderBottom: "1px solid #e5e5e5",
        alignItems: "center",
      }}
    >
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        B
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <em>I</em>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <s>S</s>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <IconList/>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <IconListNumbers/>
      </Btn>

      <div style={{ flex: 1 }} />

      <Btn onClick={onOpenHtml} title="Edytuj HTML">
        {"<>"}
      </Btn>
    </div>
  );
}

export function RichTextEditor({
  value = "<p></p>",
  onChange,
  editable = true,
}: Props) {
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [htmlError, setHtmlError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // ✅ ważne w Next/SSR
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value,
    editable,
    editorProps: {
      attributes: { class: "rte-content" },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // sync z parent -> editor (np. po pobraniu danych z API)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const openHtml = () => {
    if (!editor) return;
    setHtmlError(null);
    setHtmlDraft(editor.getHTML());
    setHtmlOpen(true);
  };

  const applyHtml = () => {
    if (!editor) return;

    try {
      // setContent z HTML (w Tiptap HTML jest parse’owany do dokumentu)
      editor.commands.setContent(htmlDraft);
      setHtmlOpen(false);
      setHtmlError(null);

      // wymuś od razu onChange
      onChange?.(editor.getHTML());
    } catch (e: any) {
      setHtmlError("Nie udało się wczytać HTML. Sprawdź czy kod jest poprawny.");
    }
  };

  return (
    <div
      className={"richTextEditor border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border"}
    >
      {editable && <Toolbar editor={editor} onOpenHtml={openHtml} />}

      <div style={{ padding: 12 }}>
        <EditorContent style={{ }}editor={editor} />
      </div>

      <Modal open={htmlOpen} title="Edytuj HTML" onClose={() => setHtmlOpen(false)}>
        <div style={{ display: "grid", gap: 10 }}>
          <Textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            spellCheck={false}
          />

          {htmlError && <div style={{ color: "crimson" }}>{htmlError}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setHtmlOpen(false)}
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={applyHtml}
            >
              Zastosuj
            </button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .rte-content {
          min-height: 160px;
          outline: none;
        }
        .rte-content p { margin: 0 0 0.75rem; }
    
        .rte-content ul, .rte-content ol { padding-left: 1.25rem; margin: 0 0 0.75rem; }
        .rte-content a { text-decoration: underline; }
      `}</style>
    </div>
  );
}