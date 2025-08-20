import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Download,
  X,
  Loader2,
  SkipBack,
  SkipForward
} from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { Slider } from '@/components/ui/slider' // Not available, using input range instead
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/utils'

interface VideoViewerProps {
  src: string
  title?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  thumbnail?: string
  width?: number | string
  height?: number | string
}

interface VideoViewerDialogProps extends VideoViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Full-featured video player with custom controls
export function VideoPlayer({
  src,
  title = 'Video',
  className,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  thumbnail,
  width = '100%',
  height = 'auto'
}: VideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Control auto-hide timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [src])

  // Handle mouse movement for auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
      video.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      video.muted = false
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const downloadVideo = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = title || 'video'
    link.click()
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-black rounded-lg overflow-hidden group', className)}
      style={{ width, height: height === 'auto' ? undefined : height }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className='w-full h-full object-contain'
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload='metadata'
        controls={!controls} // Use browser controls if custom controls disabled
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <Loader2 className='h-8 w-8 animate-spin text-white' />
        </div>
      )}

      {/* Custom Controls */}
      {controls && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Center Play Button */}
          {!isPlaying && !isLoading && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Button
                variant='ghost'
                size='lg'
                onClick={togglePlay}
                className='bg-black/50 hover:bg-black/70 text-white rounded-full p-4'
              >
                <Play className='h-8 w-8' fill='white' />
              </Button>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
            {/* Progress Bar */}
            <div className='mb-3'>
              <input
                type='range'
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek([parseFloat(e.target.value)])}
                className='w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider'
                style={{
                  background: `linear-gradient(to right, #fff 0%, #fff ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>

            {/* Controls Row */}
            <div className='flex items-center justify-between text-white'>
              <div className='flex items-center gap-2'>
                {/* Play/Pause */}
                <Button variant='ghost' size='sm' onClick={togglePlay} className='text-white hover:bg-white/20'>
                  {isPlaying ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' fill='white' />}
                </Button>

                {/* Skip Buttons */}
                <Button variant='ghost' size='sm' onClick={() => skip(-10)} className='text-white hover:bg-white/20'>
                  <SkipBack className='h-4 w-4' />
                </Button>

                <Button variant='ghost' size='sm' onClick={() => skip(10)} className='text-white hover:bg-white/20'>
                  <SkipForward className='h-4 w-4' />
                </Button>

                {/* Restart */}
                <Button variant='ghost' size='sm' onClick={restart} className='text-white hover:bg-white/20'>
                  <RotateCcw className='h-4 w-4' />
                </Button>

                {/* Volume */}
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='sm' onClick={toggleMute} className='text-white hover:bg-white/20'>
                    {isMuted || volume === 0 ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
                  </Button>
                  <input
                    type='range'
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
                    className='w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer'
                  />
                </div>

                {/* Time Display */}
                <span className='text-sm whitespace-nowrap'>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                {/* Settings Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='text-white hover:bg-white/20'>
                      <Settings className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>
                      Speed: 0.5x {playbackRate === 0.5 && '✓'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1)}>
                      Speed: 1x {playbackRate === 1 && '✓'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>
                      Speed: 1.25x {playbackRate === 1.25 && '✓'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>
                      Speed: 1.5x {playbackRate === 1.5 && '✓'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(2)}>
                      Speed: 2x {playbackRate === 2 && '✓'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Download */}
                <Button variant='ghost' size='sm' onClick={downloadVideo} className='text-white hover:bg-white/20'>
                  <Download className='h-4 w-4' />
                </Button>

                {/* Fullscreen */}
                <Button variant='ghost' size='sm' onClick={toggleFullscreen} className='text-white hover:bg-white/20'>
                  {isFullscreen ? <Minimize className='h-4 w-4' /> : <Maximize className='h-4 w-4' />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple video player without custom controls
export function SimpleVideoPlayer({
  src,
  className,
  thumbnail,
  width = '100%',
  height = 'auto',
  ...props
}: VideoViewerProps) {
  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <video
        src={src}
        poster={thumbnail}
        className='w-full h-full object-contain'
        style={{ width, height: height === 'auto' ? undefined : height }}
        controls
        preload='metadata'
        {...props}
      />
    </div>
  )
}

// Video viewer in dialog/modal
export function VideoViewerDialog({
  open,
  onOpenChange,
  src,
  title = 'Video Player',
  ...props
}: VideoViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
        <DialogHeader className='p-6 pb-0'>
          <DialogTitle className='flex items-center justify-between'>
            {title}
            <Button variant='ghost' size='sm' onClick={() => onOpenChange(false)}>
              <X className='h-4 w-4' />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className='p-6 pt-0'>
          <VideoPlayer src={src} title={title} className='w-full' height='60vh' {...props} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Video thumbnail with play overlay
export function VideoThumbnail({
  src,
  thumbnail,
  title,
  className,
  onClick,
  width = 200,
  height = 120
}: VideoViewerProps & {
  onClick?: () => void
  width?: number
  height?: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn('relative rounded-lg overflow-hidden cursor-pointer group', className)}
      style={{ width, height }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {thumbnail ? (
        <img src={thumbnail} alt={title} className='w-full h-full object-cover' />
      ) : (
        <video src={src} className='w-full h-full object-cover' muted preload='metadata' />
      )}

      {/* Play Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-80'
        )}
      >
        <div
          className={cn(
            'bg-white/20 backdrop-blur-sm rounded-full p-3 transition-transform',
            isHovered ? 'scale-110' : 'scale-100'
          )}
        >
          <Play className='h-6 w-6 text-white' fill='white' />
        </div>
      </div>

      {/* Title Overlay */}
      {title && (
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2'>
          <p className='text-white text-sm font-medium truncate'>{title}</p>
        </div>
      )}
    </div>
  )
}

// Default export
export default VideoPlayer
