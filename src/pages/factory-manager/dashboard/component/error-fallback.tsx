import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorFallbackProps {
  title?: string
  description?: string
  onRetry?: () => void
  showRetryButton?: boolean
}

export function ErrorFallback({
  title = 'Không thể tải dữ liệu',
  description = 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  showRetryButton = true
}: ErrorFallbackProps) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertCircle className='h-5 w-5 text-destructive' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {showRetryButton && onRetry && (
        <CardContent>
          <Button onClick={onRetry} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Thử lại
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export function ErrorAlert({
  title = 'Lỗi tải dữ liệu',
  description = 'Một số dữ liệu có thể không được cập nhật.',
  onRetry,
  showRetryButton = true
}: ErrorFallbackProps) {
  return (
    <Alert variant='destructive' className='mb-4'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className='flex items-center justify-between'>
        <span>{description}</span>
        {showRetryButton && onRetry && (
          <Button onClick={onRetry} variant='outline' size='sm' className='ml-4'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Thử lại
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
