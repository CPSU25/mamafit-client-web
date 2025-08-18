import { Editor } from '@tiptap/core'
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  LucideIcon,
  MonitorPlay,
  Quote,
  SquareSplitVertical
} from 'lucide-react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils/utils'

interface MenuProps {
  editor: Editor | null
  className?: string
}

export interface EditorMenu {
  name: string
  icon: LucideIcon
  onClick?: (e?: React.MouseEvent) => void
  isActive: boolean
  showDivider?: boolean
}

export default function TiptapMenu({ editor, className }: MenuProps) {
  if (!editor) return null

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 300,
        height: 300
      })
    }
  }

  const EDITOR_MENU: EditorMenu[] = [
    {
      name: 'heading-1',
      icon: Heading1,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      },
      isActive: editor.isActive('heading', { level: 1 })
    },
    {
      name: 'heading-2',
      icon: Heading2,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      },
      isActive: editor.isActive('heading', { level: 2 })
    },
    {
      name: 'bold',
      icon: Bold,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleBold().run()
      },
      isActive: editor.isActive('bold')
    },
    {
      name: 'italic',
      icon: Italic,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleItalic().run()
      },
      isActive: editor.isActive('italic')
    },
    {
      name: 'blockquote',
      icon: Quote,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleBlockquote().run()
      },
      isActive: editor.isActive('blockquote'),
      showDivider: true
    },
    {
      name: 'yt',
      icon: MonitorPlay,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        addYoutubeVideo()
      },
      isActive: false
    },
    {
      name: 'divider',
      icon: SquareSplitVertical,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().setHorizontalRule().run()
      },
      isActive: false,
      showDivider: true
    },
    {
      name: 'bulletList',
      icon: List,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleBulletList().run()
      },
      isActive: editor.isActive('bulletList')
    },
    {
      name: 'orderedList',
      icon: ListOrdered,
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault()
        editor.chain().focus().toggleOrderedList().run()
      },
      isActive: editor.isActive('orderedList')
    }

    // {
    //   name: 'underline',
    //   icon: <Underline className='w-5 h-5' />,
    //   onClick: () => editor.chain().focus().toggleUnderline().run(),
    //   isActive: editor.isActive('underline'),
    //   showDivider: true
    // },
    // {
    //   name: 'bulletList',
    //   icon: <List className='w-5 h-5' />,
    //   onClick: () => editor.chain().focus().toggleBulletList().run(),
    //   isActive: editor.isActive('bulletList')
    // },
    // {
    //   name: 'orderedList',
    //   icon: <ListOrdered className='w-5 h-5' />,
    //   onClick: () => editor.chain().focus().toggleOrderedList().run(),
    //   isActive: editor.isActive('orderedList'),
    //   showDivider: true
    // }
  ]

  return (
    <div className={cn('flex items-center gap-1 p-2', className)}>
      {EDITOR_MENU.map((item) => (
        <div key={item.name} className='flex items-center gap-1'>
          <Button
            type='button'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              item.onClick?.(e)
            }}
            className={cn(
              'h-8 w-8',
              item.isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            size='icon'
            variant='ghost'
          >
            <item.icon className='h-4 w-4' />
          </Button>
          {item.showDivider && <Separator orientation='vertical' className='h-6 mx-1' />}
        </div>
      ))}
    </div>
  )
}
