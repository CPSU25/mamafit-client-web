# Cloudinary Upload Service Documentation

## Tổng quan

Service này cung cấp chức năng upload ảnh lên Cloudinary với các tính năng:
- Upload ảnh đơn hoặc nhiều ảnh cùng lúc
- Validation file type và size
- Progress tracking
- Error handling với toast notifications
- URL transformation và thumbnail generation
- React components sẵn sàng sử dụng
- **Hỗ trợ unsigned upload** (không cần API secret)

## Cài đặt

### 1. Cài đặt Cloudinary (nếu chưa có)

```bash
npm install cloudinary
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong root project và thêm:

```env
VITE_CLOUDINARY_CLOUD_NAME=dzykiyef5
VITE_CLOUDINARY_UPLOAD_PRESET=mamafit-upload
VITE_CLOUDINARY_API_KEY=262352624648691
```

### 3. Khởi động lại Development Server

Sau khi tạo `.env`, khởi động lại server:

```bash
npm run dev
```

## Sử dụng Service

### Service API

```typescript
import { cloudinaryService, useCloudinaryUpload } from '@/services/upload/cloudinary.service'

// Sử dụng service trực tiếp
const result = await cloudinaryService.uploadImage(file, {
  folder: 'products',
  tags: ['product', 'gallery']
})

// Hoặc sử dụng React hook
const { uploadSingle, uploadMultiple, isConfigured } = useCloudinaryUpload()
```

### Upload Options (Unsigned Upload)

```typescript
interface UploadOptions {
  // Các parameter được phép với unsigned upload
  folder?: string                     // Folder trên Cloudinary
  public_id?: string                 // Custom public ID
  tags?: string | string[]           // Tags để phân loại
  context?: Record<string, string>   // Metadata context
  
  // Transformation options (áp dụng qua URL sau upload)
  width?: number                     // Width constraint  
  height?: number                    // Height constraint
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad'  // Crop mode
  quality?: 'auto' | number         // Quality setting
  format?: 'auto' | 'jpg' | 'png' | 'webp'  // Output format
}
```

**⚠️ Lưu ý quan trọng**: Với **unsigned upload**, các parameter như `quality`, `format`, `width`, `height` sẽ được áp dụng qua **URL transformation** sau khi upload, không phải trong quá trình upload.

## React Components

### 1. CloudinaryImageUpload (Multiple Images)

```typescript
import { CloudinaryImageUpload } from '@/components/ui/cloudinary-image-upload'

function ProductGallery() {
  const [images, setImages] = useState<string[]>([])

  return (
    <CloudinaryImageUpload
      value={images}
      onChange={setImages}
      maxFiles={5}
      uploadOptions={{
        folder: 'products',
        tags: ['product', 'gallery'],
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto'
      }}
      placeholder="Upload product images"
    />
  )
}
```

### 2. CloudinarySingleImageUpload (Single Image)

```typescript
import { CloudinarySingleImageUpload } from '@/components/ui/cloudinary-single-image-upload'

function AvatarUpload() {
  const [avatar, setAvatar] = useState<string>('')

  return (
    <CloudinarySingleImageUpload
      value={avatar}
      onChange={setAvatar}
      uploadOptions={{
        folder: 'avatars',
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      }}
      placeholder="Upload your avatar"
    />
  )
}
```

## Ví dụ sử dụng thực tế

### Upload với folder và tags

```typescript
<CloudinaryImageUpload
  value={productImages}
  onChange={setProductImages}
  uploadOptions={{
    folder: 'products/summer-2024',
    tags: ['product', 'summer', 'sale'],
    context: {
      category: 'clothing',
      season: 'summer'
    },
    // Transformations sẽ áp dụng qua URL
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    format: 'webp'
  }}
/>
```

### Upload avatar với transformations

```typescript
<CloudinarySingleImageUpload
  value={userAvatar}
  onChange={setUserAvatar}
  uploadOptions={{
    folder: 'users/avatars',
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  }}
/>
```

## Cách hoạt động của Transformations

Với **unsigned upload**, transformations hoạt động như sau:

1. **Upload**: File được upload lên Cloudinary với folder, tags, etc.
2. **URL Generation**: Service tự động tạo URL với transformations
3. **Result**: Bạn nhận được URL đã được optimize

Ví dụ:
```typescript
// Input options
{
  folder: 'products',
  width: 300,
  height: 200,
  crop: 'fill',
  quality: 'auto'
}

// Resulting URL
https://res.cloudinary.com/dzykiyef5/image/upload/w_300,h_200,c_fill,q_auto/products/abc123.jpg
```

## Error Handling

Service sẽ tự động xử lý các lỗi phổ biến:

- **File validation**: Type và size
- **Upload errors**: Network, server errors
- **Configuration errors**: Missing credentials
- **Toast notifications**: User-friendly messages

```typescript
try {
  const result = await uploadSingle(file, options)
  // Success - URL đã sẵn sàng sử dụng
} catch (error) {
  // Error đã được toast, có thể handle thêm nếu cần
  console.error('Upload failed:', error)
}
```

## Utility Functions

### Generate URLs

```typescript
import { cloudinaryService } from '@/services/upload/cloudinary.service'

// Get optimized thumbnail
const thumbnailUrl = cloudinaryService.getThumbnailUrl('public_id', 150, 150)

// Get transformed URL
const transformedUrl = cloudinaryService.getTransformedUrl('public_id', [
  { w: 400, h: 300, c: 'fill' },
  { q: 'auto', f: 'webp' }
])
```

## Best Practices

1. **Folder organization**: Sử dụng folders để tổ chức ảnh logic
   ```typescript
   folder: 'products/category/subcategory'
   ```

2. **Tags hiệu quả**: Sử dụng tags để search và filter
   ```typescript
   tags: ['product', 'featured', 'sale']
   ```

3. **Transformation optimization**: 
   ```typescript
   {
     quality: 'auto',  // Tự động optimize quality
     format: 'auto',   // Tự động chọn format tốt nhất
     crop: 'fill'      // Đảm bảo đúng kích thước
   }
   ```

4. **File size limits**: Giới hạn 10MB, có thể tùy chỉnh nếu cần

## Troubleshooting

### "Cloudinary chưa được cấu hình"
- ✅ Kiểm tra file `.env` có đúng format không
- ✅ Restart development server sau khi thêm env vars
- ✅ Đảm bảo prefix `VITE_` cho Vite project

### "Format parameter is not allowed"
- ✅ **Đã fix**: Service không còn gửi format trong upload request
- ✅ Format được áp dụng qua URL transformation

### Upload fails
- ✅ Kiểm tra upload preset `mamafit-upload` có tồn tại
- ✅ Kiểm tra upload preset ở mode `Unsigned`
- ✅ Kiểm tra network trong browser DevTools

### Images không hiển thị
- ✅ Kiểm tra URL có đúng không
- ✅ Kiểm tra CORS settings trên Cloudinary
- ✅ Kiểm tra Cloudinary delivery settings

## Cấu hình Upload Preset

Trong Cloudinary Console > Upload Presets > `mamafit-upload`:

- **Mode**: Unsigned ✅
- **Use filename**: false
- **Unique filename**: true
- **Overwrite**: false
- **Auto backup**: true (recommended)
- **Max file size**: 10MB
- **Incoming transformation**: `q_auto,f_auto` (recommended) 