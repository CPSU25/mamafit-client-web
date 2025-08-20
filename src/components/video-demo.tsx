import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FirebaseVideoUpload } from '@/components/firebase-video-upload'
import { VideoPlayer, VideoViewerDialog, VideoThumbnail, SimpleVideoPlayer } from '@/components/video-viewer'
import { Play } from 'lucide-react'

export function VideoDemo() {
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Sample video URLs for demo
  const sampleVideos = [
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
  ]

  const handleVideoSelect = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
    setDialogOpen(true)
  }

  const allVideos = [...uploadedVideos, ...sampleVideos]

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>Video Upload & Viewer Demo</h1>
        <p className='text-muted-foreground'>
          Demo các component upload video lên Firebase và xem video với full controls
        </p>
      </div>

      <Tabs defaultValue='upload' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='upload'>Upload Video</TabsTrigger>
          <TabsTrigger value='player'>Video Player</TabsTrigger>
          <TabsTrigger value='gallery'>Video Gallery</TabsTrigger>
          <TabsTrigger value='simple'>Simple Player</TabsTrigger>
        </TabsList>

        {/* Video Upload Tab */}
        <TabsContent value='upload'>
          <Card>
            <CardHeader>
              <CardTitle>Firebase Video Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <FirebaseVideoUpload
                value={uploadedVideos}
                onChange={setUploadedVideos}
                maxFiles={5}
                placeholder='Upload your videos to Firebase Storage'
                uploadOptions={{
                  folder: 'demo-videos/',
                  fileName: 'demo-video'
                }}
              />

              {uploadedVideos.length > 0 && (
                <div className='mt-6'>
                  <h3 className='font-medium mb-3'>Uploaded Videos:</h3>
                  <div className='space-y-2'>
                    {uploadedVideos.map((url, index) => (
                      <div key={index} className='flex items-center justify-between p-2 border rounded'>
                        <span className='text-sm truncate'>{url}</span>
                        <Button size='sm' onClick={() => handleVideoSelect(url)}>
                          <Play className='h-4 w-4 mr-1' />
                          Play
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Video Player Tab */}
        <TabsContent value='player'>
          <Card>
            <CardHeader>
              <CardTitle>Advanced Video Player</CardTitle>
            </CardHeader>
            <CardContent>
              {allVideos.length > 0 ? (
                <div className='space-y-4'>
                  <div className='flex gap-2 flex-wrap'>
                    {allVideos.map((url, index) => (
                      <Button key={index} variant='outline' size='sm' onClick={() => setSelectedVideo(url)}>
                        Video {index + 1}
                      </Button>
                    ))}
                  </div>

                  {selectedVideo && (
                    <VideoPlayer
                      src={selectedVideo}
                      title={`Demo Video - ${selectedVideo.split('/').pop()}`}
                      autoPlay={false}
                      controls={true}
                      className='w-full max-w-4xl mx-auto'
                      height='500px'
                    />
                  )}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  Upload some videos first to see the player in action
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Gallery Tab */}
        <TabsContent value='gallery'>
          <Card>
            <CardHeader>
              <CardTitle>Video Gallery with Thumbnails</CardTitle>
            </CardHeader>
            <CardContent>
              {allVideos.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {allVideos.map((url, index) => (
                    <VideoThumbnail
                      key={index}
                      src={url}
                      title={`Demo Video ${index + 1}`}
                      width={300}
                      height={200}
                      onClick={() => handleVideoSelect(url)}
                      className='w-full'
                    />
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>Upload some videos to see the gallery</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simple Player Tab */}
        <TabsContent value='simple'>
          <Card>
            <CardHeader>
              <CardTitle>Simple Video Player (Browser Controls)</CardTitle>
            </CardHeader>
            <CardContent>
              {allVideos.length > 0 ? (
                <div className='space-y-4'>
                  <div className='flex gap-2 flex-wrap'>
                    {allVideos.map((url, index) => (
                      <Button key={index} variant='outline' size='sm' onClick={() => setSelectedVideo(url)}>
                        Video {index + 1}
                      </Button>
                    ))}
                  </div>

                  {selectedVideo && (
                    <SimpleVideoPlayer
                      src={selectedVideo}
                      title={`Simple Player - ${selectedVideo.split('/').pop()}`}
                      className='w-full max-w-4xl mx-auto'
                      controls={true}
                    />
                  )}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  Upload some videos first to see the simple player
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Dialog */}
      <VideoViewerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        src={selectedVideo}
        title='Video Viewer'
        autoPlay={true}
      />
    </div>
  )
}

export default VideoDemo
