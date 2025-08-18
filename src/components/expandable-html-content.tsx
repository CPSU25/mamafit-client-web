import { Button } from '@/components/ui/button'
import { useState } from 'react'

const ExpandableHtmlContent = ({ content, maxLength = 200 }: { content: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const textContent = content.replace(/<[^>]*>/g, '')
  const shouldShowExpandButton = textContent.length > maxLength

  const displayContent = !shouldShowExpandButton || isExpanded ? content : content.substring(0, maxLength) + '...'

  return (
    <div className='space-y-2'>
      <div
        className='prose prose-sm max-w-none text-muted-foreground break-words overflow-hidden'
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '100%'
        }}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
      {shouldShowExpandButton && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='h-6 p-0 text-xs text-primary hover:text-primary/80'
        >
          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      )}
    </div>
  )
}
export default ExpandableHtmlContent
