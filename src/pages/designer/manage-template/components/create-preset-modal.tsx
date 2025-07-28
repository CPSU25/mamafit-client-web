import { useState } from 'react'
import { Upload, Palette, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SingleImageUpload } from '@/components/ui/single-image-upload'
// import { Badge } from '@/components/ui/badge'

interface CreatePresetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (presetData: PresetData) => void
}

interface PresetData {
  image: string
  collar: string
  body: string
  sleeves: string
  skirt: string
}

const componentOptions = {
  collar: ['V-Neck', 'Round Neck', 'Scoop Neck', 'Boat Neck', 'Turtleneck'],
  body: ['A-Line', 'Fitted', 'Empire Waist', 'Wrap Style', 'Straight Cut'],
  sleeves: ['Sleeveless', 'Short Sleeve', 'Long Sleeve', '3/4 Sleeve', 'Cap Sleeve'],
  skirt: ['A-Line', 'Pencil', 'Pleated', 'Flared', 'Straight']
}

const componentColors = {
  collar: 'bg-blue-500',
  body: 'bg-green-500',
  sleeves: 'bg-purple-500',
  skirt: 'bg-orange-500'
}

const componentLabels = {
  collar: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  body: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  sleeves: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  skirt: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
}

export default function CreatePresetModal({ open, onOpenChange, onSave }: CreatePresetModalProps) {
  const [presetData, setPresetData] = useState<PresetData>({
    image: '',
    collar: '',
    body: '',
    sleeves: '',
    skirt: ''
  })

  const handleSave = () => {
    if (onSave) {
      onSave(presetData)
    }
    onOpenChange(false)
  }

  const handleImageChange = (value: string) => {
    setPresetData((prev) => ({ ...prev, image: value }))
  }

  const handleComponentChange = (component: keyof Omit<PresetData, 'image'>, value: string) => {
    setPresetData((prev) => ({ ...prev, [component]: value }))
  }

  const isFormValid = presetData.image && presetData.collar && presetData.body && presetData.sleeves && presetData.skirt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[1600px] !max-w-[1000px] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/30'>
        <DialogHeader className='text-center pb-4'>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3'>
            <Sparkles className='h-8 w-8 text-purple-500' />
            Create New Preset
          </DialogTitle>
          <DialogDescription className='text-lg text-gray-600 mt-3'>
            Design a stunning dress preset by selecting components and uploading an image
          </DialogDescription>
        </DialogHeader>

        <div className='relative grid grid-cols-12 gap-14 py-10'>
          {/* SVG Overlay for Connection Lines */}
          <svg className='absolute inset-0 w-full h-full pointer-events-none z-10' style={{ overflow: 'visible' }}>
            <defs>
              <marker id='arrowhead-blue' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>
                <polygon points='0 0, 10 3.5, 0 7' fill='#3B82F6' />
              </marker>
              <marker id='arrowhead-green' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>
                <polygon points='0 0, 10 3.5, 0 7' fill='#10B981' />
              </marker>
              <marker id='arrowhead-purple' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>
                <polygon points='0 0, 10 3.5, 0 7' fill='#8B5CF6' />
              </marker>
              <marker id='arrowhead-orange' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>
                <polygon points='0 0, 10 3.5, 0 7' fill='#F59E0B' />
              </marker>
            </defs>

            {/* Collar line - from left collar dropdown to top center of dress */}
            <path
              d='M 200 130 Q 410 10 470 100'
              stroke='#3B82F6'
              strokeWidth='2'
              fill='none'
              strokeDasharray='5,5'
              markerEnd='url(#arrowhead-blue)'
              className='animate-pulse'
            />

            {/* Body line - from left body dropdown to center of dress */}
            <path
              d='M 200 330 Q 300 300 400 250'
              stroke='#10B981'
              strokeWidth='2'
              fill='none'
              strokeDasharray='5,5'
              markerEnd='url(#arrowhead-green)'
              className='animate-pulse'
            />

            {/* Sleeves line - from right sleeves dropdown to shoulder area */}
            <path
              d='M 750 150 Q 700 100 580 140'
              stroke='#8B5CF6'
              strokeWidth='2'
              fill='none'
              strokeDasharray='5,5'
              markerEnd='url(#arrowhead-purple)'
              className='animate-pulse'
            />

            {/* Skirt line - from right skirt dropdown to bottom of dress */}
            <path
              d='M 790 400 Q 680 580 580 500'
              stroke='#F59E0B'
              strokeWidth='2'
              fill='none'
              strokeDasharray='5,5'
              markerEnd='url(#arrowhead-orange)'
              className='animate-pulse'
            />
          </svg>

          {/* Left Column - Collar and Body */}
          <div className='col-span-3 space-y-16'>
            <div className='space-y-6'>
              <div className='flex items-center gap-3'>
                <div className={`w-4 h-4 rounded-full ${componentColors.collar}`}></div>
                <Label htmlFor='collar' className={`text-xl font-semibold ${componentLabels.collar.color}`}>
                  Collar Style
                </Label>
              </div>
              <div
                className={`p-6 rounded-xl border-2 ${componentLabels.collar.bg} ${componentLabels.collar.border} shadow-lg`}
              >
                <Select value={presetData.collar} onValueChange={(value) => handleComponentChange('collar', value)}>
                  <SelectTrigger className='bg-white/80 border-gray-200 hover:border-blue-300 transition-colors h-12 text-base'>
                    <SelectValue placeholder='Choose collar style' />
                  </SelectTrigger>
                  <SelectContent>
                    {componentOptions.collar.map((option) => (
                      <SelectItem key={option} value={option} className='text-base'>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center gap-3'>
                <div className={`w-4 h-4 rounded-full ${componentColors.body}`}></div>
                <Label htmlFor='body' className={`text-xl font-semibold ${componentLabels.body.color}`}>
                  Body Style
                </Label>
              </div>
              <div
                className={`p-6 rounded-xl border-2 ${componentLabels.body.bg} ${componentLabels.body.border} shadow-lg`}
              >
                <Select value={presetData.body} onValueChange={(value) => handleComponentChange('body', value)}>
                  <SelectTrigger className='bg-white/80 border-gray-200 hover:border-green-300 transition-colors h-12 text-base'>
                    <SelectValue placeholder='Choose body style' />
                  </SelectTrigger>
                  <SelectContent>
                    {componentOptions.body.map((option) => (
                      <SelectItem key={option} value={option} className='text-base'>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Center Column - Image */}
          <div className='col-span-6 flex flex-col items-center space-y-8'>
            <div className='relative'>
              <div className='relative w-[420px] h-[540px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-4 border-dashed border-gray-300 shadow-2xl overflow-hidden'>
                {presetData.image ? (
                  <img src={presetData.image} alt='Preset preview' className='w-full h-full object-cover' />
                ) : (
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-center space-y-8'>
                    <div className='w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center'>
                      <Upload className='h-12 w-12 text-purple-500' />
                    </div>
                    <div className='space-y-3'>
                      <p className='text-2xl font-semibold text-gray-600'>Dress Image Preview</p>
                      <p className='text-base text-gray-500'>Upload an image to see your design</p>
                    </div>
                  </div>
                )}
                Component indicators on the dress
              </div>
            </div>

            {/* Enhanced Image Upload Component */}
            <div className='w-[420px] p-8 bg-white rounded-xl shadow-lg border border-gray-200'>
              <div className='flex items-center gap-3 mb-6'>
                <Palette className='h-6 w-6 text-purple-500' />
                <h3 className='text-xl font-semibold text-gray-800'>Upload Design Image</h3>
              </div>
              <SingleImageUpload
                value={presetData.image}
                onChange={handleImageChange}
                placeholder='Upload your dress design'
                className='w-full'
              />
            </div>
          </div>

          {/* Right Column - Sleeves and Skirt */}
          <div className='col-span-3 space-y-16'>
            <div className='space-y-6'>
              <div className='flex items-center gap-3'>
                <div className={`w-4 h-4 rounded-full ${componentColors.sleeves}`}></div>
                <Label htmlFor='sleeves' className={`text-xl font-semibold ${componentLabels.sleeves.color}`}>
                  Sleeves Style
                </Label>
              </div>
              <div
                className={`p-6 rounded-xl border-2 ${componentLabels.sleeves.bg} ${componentLabels.sleeves.border} shadow-lg`}
              >
                <Select value={presetData.sleeves} onValueChange={(value) => handleComponentChange('sleeves', value)}>
                  <SelectTrigger className='bg-white/80 border-gray-200 hover:border-purple-300 transition-colors h-12 text-base'>
                    <SelectValue placeholder='Choose sleeve style' />
                  </SelectTrigger>
                  <SelectContent>
                    {componentOptions.sleeves.map((option) => (
                      <SelectItem key={option} value={option} className='text-base'>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center gap-3'>
                <div className={`w-4 h-4 rounded-full ${componentColors.skirt}`}></div>
                <Label htmlFor='skirt' className={`text-xl font-semibold ${componentLabels.skirt.color}`}>
                  Skirt Style
                </Label>
              </div>
              <div
                className={`p-6 rounded-xl border-2 ${componentLabels.skirt.bg} ${componentLabels.skirt.border} shadow-lg`}
              >
                <Select value={presetData.skirt} onValueChange={(value) => handleComponentChange('skirt', value)}>
                  <SelectTrigger className='bg-white/80 border-gray-200 hover:border-orange-300 transition-colors h-12 text-base'>
                    <SelectValue placeholder='Choose skirt style' />
                  </SelectTrigger>
                  <SelectContent>
                    {componentOptions.skirt.map((option) => (
                      <SelectItem key={option} value={option} className='text-base'>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='bg-gray-50/50 -mx-6 -mb-6 px-8 py-6 rounded-b-lg'>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center gap-3'>
              <div className={`w-3 h-3 rounded-full ${isFormValid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`text-base ${isFormValid ? 'text-green-600' : 'text-gray-500'}`}>
                {isFormValid ? 'Ready to save' : 'Please complete all fields'}
              </span>
            </div>
            <div className='flex gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='px-8 py-3 text-base hover:bg-gray-100'
              >
                Cancel
              </Button>
              <Button
                type='button'
                onClick={handleSave}
                disabled={!isFormValid}
                className='px-10 py-3 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Sparkles className='h-5 w-5 mr-2' />
                Save Preset
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
