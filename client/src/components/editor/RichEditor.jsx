import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Quote, Undo, Redo, Code, Type, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (active) => `p-2 rounded hover:bg-white/10 transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-textMuted'}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-black/20 sticky top-0 z-20">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>
        <Heading1 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>
        <Heading2 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>
        <List size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>
        <ListOrdered size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))}>
        <Code size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1 self-center" />
      <button onClick={() => editor.chain().focus().undo().run()} className={btnClass()}>
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btnClass()}>
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function RichEditor({ content, onChange, onSelectionChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Begin your knowledge synthesis...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        const selectedText = editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ' '
        );
        onSelectionChange(selectedText);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[500px] p-6 text-black',
      },
    },
  });

  // Update editor content when prop changes (e.g. AI generation)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && content !== '') {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div id="rich-editor-container" className="glass-panel overflow-hidden border-primary/20 flex flex-col h-full">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-b-xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
