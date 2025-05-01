import { ModeToggle } from '@/components/mode-toggle'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

function App() {
  return (
    <div className='max-w-screen h-screen flex justify-center items-center gap-2'>
      <Input placeholder='Type here...' className='w-72' autoFocus type='password' StartIcon={Lock} />
      <ModeToggle />
      <Button
        onClick={() =>
          toast('Scheduled: Catch up', {
            description: 'Friday, February 10, 2023 at 5:57 PM'
          })
        }
      >
        MamaFit
      </Button>
    </div>
  )
}

export default App
