// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
// import { UploadOptions } from '@/services/upload/cloudinary.service'

// // Example 1: Simple Single Image Upload
// export function AvatarUploadExample() {
//   const [avatar, setAvatar] = useState<string>('')

//   const avatarOptions: UploadOptions = {
//     folder: 'avatars',
//     width: 300,
//     height: 300,
//     crop: 'fill',
//     quality: 'auto',
//     format: 'webp'
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Avatar Upload</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <CloudinaryImageUpload
//           value={avatar}
//           onChange={setAvatar}
//           uploadOptions={avatarOptions}
//           placeholder='Upload your avatar'
//         />
//         {avatar && (
//           <div className='mt-4'>
//             <p className='text-sm text-gray-600'>Avatar URL:</p>
//             <p className='text-xs break-all'>{avatar}</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// // Example 2: Product Gallery Upload
// export function ProductGalleryExample() {
//   const [productImages, setProductImages] = useState<string[]>([])

//   const productOptions: UploadOptions = {
//     folder: 'products',
//     quality: 'auto',
//     format: 'auto',
//     width: 800,
//     height: 600,
//     crop: 'limit'
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Product Gallery</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <CloudinaryImageUpload
//           value={productImages}
//           onChange={setProductImages}
//           maxFiles={8}
//           uploadOptions={productOptions}
//           placeholder='Upload product images'
//         />
//         {productImages.length > 0 && (
//           <div className='mt-4'>
//             <p className='text-sm text-gray-600'>Uploaded {productImages.length} images</p>
//             <pre className='text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32'>
//               {JSON.stringify(productImages, null, 2)}
//             </pre>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// // Example 3: Form Integration with React Hook Form
// interface ProductFormData {
//   name: string
//   description: string
//   category: string
//   mainImage: string
//   galleryImages: string[]
// }

// export function ProductFormExample() {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors }
//   } = useForm<ProductFormData>({
//     defaultValues: {
//       name: '',
//       description: '',
//       category: '',
//       mainImage: '',
//       galleryImages: []
//     }
//   })

//   const mainImage = watch('mainImage')
//   const galleryImages = watch('galleryImages')

//   const onSubmit = (data: ProductFormData) => {
//     console.log('Form submitted:', data)
//     alert('Check console for form data')
//   }

//   const mainImageOptions: UploadOptions = {
//     folder: 'products/main',
//     width: 600,
//     height: 400,
//     crop: 'fill',
//     quality: 'auto',
//     format: 'webp'
//   }

//   const galleryOptions: UploadOptions = {
//     folder: 'products/gallery',
//     quality: 'auto',
//     format: 'auto'
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Product Form Example</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
//           {/* Basic Info */}
//           <div className='space-y-4'>
//             <div>
//               <label className='block text-sm font-medium mb-2'>Product Name *</label>
//               <Input {...register('name', { required: 'Product name is required' })} placeholder='Enter product name' />
//               {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
//             </div>

//             <div>
//               <label className='block text-sm font-medium mb-2'>Description</label>
//               <Input {...register('description')} placeholder='Enter product description' />
//             </div>

//             <div>
//               <label className='block text-sm font-medium mb-2'>Category</label>
//               <Input {...register('category')} placeholder='Enter category' />
//             </div>
//           </div>

//           {/* Main Image */}
//           <div>
//             <label className='block text-sm font-medium mb-2'>Main Product Image</label>
//             <CloudinaryImageUpload
//               value={mainImage}
//               onChange={(url) => setValue('mainImage', url)}
//               uploadOptions={mainImageOptions}
//               placeholder='Upload main product image'
//             />
//           </div>

//           {/* Gallery Images */}
//           <div>
//             <label className='block text-sm font-medium mb-2'>Product Gallery</label>
//             <CloudinaryImageUpload
//               value={galleryImages}
//               onChange={(urls) => setValue('galleryImages', urls)}
//               maxFiles={6}
//               uploadOptions={galleryOptions}
//               placeholder='Upload additional product images'
//             />
//           </div>

//           {/* Submit Button */}
//           <Button type='submit' className='w-full'>
//             Create Product
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

// // Example 4: Blog Post with Featured Image
// export function BlogPostExample() {
//   const [featuredImage, setFeaturedImage] = useState<string>('')
//   const [postTitle, setPostTitle] = useState<string>('')

//   const blogImageOptions: UploadOptions = {
//     folder: 'blog',
//     width: 1200,
//     height: 630,
//     crop: 'fill',
//     quality: 'auto',
//     format: 'webp'
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Blog Post Featured Image</CardTitle>
//       </CardHeader>
//       <CardContent className='space-y-4'>
//         <div>
//           <label className='block text-sm font-medium mb-2'>Post Title</label>
//           <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder='Enter blog post title' />
//         </div>

//         <div>
//           <label className='block text-sm font-medium mb-2'>Featured Image (1200x630 recommended)</label>
//           <CloudinaryImageUpload
//             value={featuredImage}
//             onChange={setFeaturedImage}
//             uploadOptions={blogImageOptions}
//             placeholder='Upload featured image'
//           />
//         </div>

//         {featuredImage && postTitle && (
//           <div className='mt-6 p-4 border rounded-lg'>
//             <h3 className='font-medium mb-2'>Preview</h3>
//             <div className='aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg'>
//               <img src={featuredImage} alt={postTitle} className='w-full h-full object-cover' />
//             </div>
//             <p className='text-center mt-2 font-medium'>{postTitle}</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// // Example 5: Document/Certificate Upload
// export function DocumentUploadExample() {
//   const [documents, setDocuments] = useState<string[]>([])

//   const documentOptions: UploadOptions = {
//     folder: 'documents',
//     quality: 'auto',
//     format: 'auto'
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Document Upload</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <CloudinaryImageUpload
//           value={documents}
//           onChange={setDocuments}
//           maxFiles={3}
//           uploadOptions={documentOptions}
//           placeholder='Upload documents, certificates, or images'
//           accept='image/*,.pdf'
//         />
//         <p className='text-xs text-gray-500 mt-2'>Accepts images and PDF files</p>
//       </CardContent>
//     </Card>
//   )
// }

// // Main Examples Page
// export function CloudinaryExamplesPage() {
//   return (
//     <div className='container mx-auto p-6 space-y-8'>
//       <div className='text-center mb-8'>
//         <h1 className='text-3xl font-bold mb-2'>Cloudinary Upload Examples</h1>
//         <p className='text-gray-600'>Different use cases for the Cloudinary upload components</p>
//       </div>

//       <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
//         <AvatarUploadExample />
//         <BlogPostExample />
//       </div>

//       <ProductGalleryExample />
//       <ProductFormExample />
//       <DocumentUploadExample />
//     </div>
//   )
// }
