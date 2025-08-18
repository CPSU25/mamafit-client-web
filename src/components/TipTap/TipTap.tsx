import FloatingMenu from '@tiptap/extension-floating-menu'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import TiptapMenu from './TipTapMenu'
import Youtube from '@tiptap/extension-youtube'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Blockquote from '@tiptap/extension-blockquote'
import Placeholder from '@tiptap/extension-placeholder'
import FileHandler from '@tiptap/extension-file-handler'
import { EditorContent, useEditor } from '@tiptap/react'
import { useFirebaseUpload } from '@/services/upload/firebase.service'
import { useEffect } from 'react'

// NOTE: the Image extension only support uploading images via URL, if you want to upload to your server use FileHandler
// https://tiptap.dev/docs/editor/extensions/functionality/filehandler

interface RichTextEditorProps {
  className?: string
  initialValue?: string
  placeholder?: string
  onChange: (content: string) => void
}

export default function Tiptap({
  className,
  onChange,
  initialValue = '',
  placeholder = 'Bắt đầu nhập nội dung...'
}: RichTextEditorProps) {
  const { uploadSingle } = useFirebaseUpload()

  const editor = useEditor({
    extensions: [
      StarterKit,
      HorizontalRule,
      Blockquote,
      Underline,
      Youtube.configure({
        controls: false,
        nocookie: true
      }),
      Link.configure({ openOnClick: true, autolink: true, defaultProtocol: 'https' }),
      Placeholder.configure({ placeholder }),
      Image,
      FloatingMenu.configure({}),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          files.forEach(async (file) => {
            try {
              const response = await uploadSingle(file)
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: response.downloadURL
                  }
                })
                .focus()
                .run()
            } catch (error) {
              console.error('Upload failed:', error)
            }
          })
        },
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach(async (file) => {
            if (htmlContent) {
              return false
            }

            try {
              const response = await uploadSingle(file)
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: response.downloadURL
                  }
                })
                .focus()
                .run()
            } catch (error) {
              console.error('Upload failed:', error)
            }
          })
        }
      })
    ],
    onFocus: ({ editor }) => editor.commands.focus('end'),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3',
        spellCheck: 'false'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html === '<p></p>' || html === '') {
        onChange('')
      } else {
        onChange(html)
      }
    },
    onCreate({ editor }) {
      // Set initialValue khi khởi tạo editor
      if (initialValue) {
        editor.commands.setContent(initialValue)
      }
    }
  })

  // Cập nhật editor content khi initialValue thay đổi
  useEffect(() => {
    if (editor && initialValue !== undefined) {
      const currentContent = editor.getHTML()
      if (currentContent !== initialValue) {
        editor.commands.setContent(initialValue)
      }
    }
  }, [editor, initialValue])

  if (!editor) return null

  return (
    <div className='relative border rounded-md overflow-hidden'>
      <TiptapMenu editor={editor} className='border-b bg-muted/50' />
      <div className={className}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
