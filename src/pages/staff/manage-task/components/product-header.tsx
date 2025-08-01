import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PresetType } from '@/@types/designer.types'

interface ProductHeaderProps {
  preset: PresetType | null
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ preset }) => {
  if (!preset) return null

  return (
    <Card>
      <CardContent className='p-6 flex flex-col md:flex-row items-start gap-6'>
        <div className='w-full md:w-1/3 lg:w-1/4'>
          <img src={preset.images[0]} alt={preset.styleName} className='rounded-lg w-full object-cover aspect-square' />
        </div>
        <div className='flex-1'>
          <CardHeader className='p-0'>
            <CardTitle className='text-3xl font-bold'>{preset.styleName}</CardTitle>
            <CardDescription className='text-base'>Mã sản phẩm: {preset.id}</CardDescription>
          </CardHeader>
          <div className='mt-4'>
            <p className='text-2xl font-semibold text-primary'>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(preset.price)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
