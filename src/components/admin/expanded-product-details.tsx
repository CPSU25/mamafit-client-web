/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Plus, Trash2, Save, Package, Info, BarChart3, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/image-upload'
import { useMaternityDressStore } from '@/stores/maternity-dress-store'
import { MaternityDressDetailFormData, MaternityDressDetailType } from '@/@types/inventory.type'
import { 
  useGetMaternityDressDetail, 
  useCreateMaternityDressDetail,
  useDeleteMaternityDressDetail
} from '@/services/maternity-dress/useMaternityDress'
import { toast } from 'sonner'

// Component riêng để xử lý hình ảnh tránh vòng lặp
function DetailProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder-image.jpg')
    }
  }

  if (hasError && imgSrc === '/placeholder-image.jpg') {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || 'w-16 h-16 rounded-xl'}`}>
        <Package className="h-6 w-6 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = [
  'Đỏ', 'Xanh Navy', 'Đen', 'Trắng', 'Hồng', 'Xanh Dương', 
  'Xám', 'Be', 'Nâu', 'Vàng', 'Tím', 'Xanh Lá'
]

export default function ExpandedProductDetails() {
  const { 
    expandedMaternityDressId,
    activeTab,
    setActiveTab
  } = useMaternityDressStore()
  
  const [showAddForm, setShowAddForm] = useState(false)

  // React Query hooks - Get maternity dress detail by ID
  const { data: maternityDressDetailData, isLoading: isLoadingDetail } = useGetMaternityDressDetail(expandedMaternityDressId || '')
  const createDetailMutation = useCreateMaternityDressDetail()
  const deleteDetailMutation = useDeleteMaternityDressDetail()

  const form = useForm<MaternityDressDetailFormData>({
    defaultValues: {
      maternityDressId: '',
      name: '',
      description: '',
      images: [],
      color: '',
      size: '',
      quantity: 0,
      price: 0,
    },
  })

  // Set maternityDressId when expandedMaternityDressId changes
  useEffect(() => {
    if (expandedMaternityDressId) {
      form.setValue('maternityDressId', expandedMaternityDressId)
    }
  }, [expandedMaternityDressId, form])

  const handleAddDetail = async (data: MaternityDressDetailFormData) => {
    if (!expandedMaternityDressId) return

    try {
      await createDetailMutation.mutateAsync({
        ...data,
        maternityDressId: expandedMaternityDressId,
      })
      toast.success('Thêm chi tiết thành công!')
      setShowAddForm(false)
      form.reset()
      // Reset maternityDressId
      form.setValue('maternityDressId', expandedMaternityDressId)
    } catch (error) {
      console.error('Error adding detail:', error)
      toast.error('Có lỗi xảy ra khi thêm chi tiết')
    }
  }

  const handleRemoveDetail = async (detailId: string) => {
    try {
      await deleteDetailMutation.mutateAsync(detailId)
      toast.success('Xóa chi tiết thành công!')
    } catch (error) {
      console.error('Error removing detail:', error)
      toast.error('Có lỗi xảy ra khi xóa chi tiết')
    }
  }

  if (!expandedMaternityDressId) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Package className="h-16 w-16 text-gray-300" />
          <p className="text-muted-foreground">Chọn một đầm bầu để xem chi tiết</p>
        </div>
      </div>
    )
  }

  // Get data from detail API response
  const maternityDress = maternityDressDetailData?.data
  const maternityDressDetails: MaternityDressDetailType[] = maternityDressDetailData?.data?.details || []

  if (isLoadingDetail || !maternityDress) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Đang tải thông tin đầm bầu...</p>
        </div>
      </div>
    )
  }

  const totalStock = maternityDressDetails.reduce((sum: number, detail: MaternityDressDetailType) => sum + detail.quantity, 0)
  const totalValue = maternityDressDetails.reduce((sum: number, detail: MaternityDressDetailType) => sum + (detail.quantity * detail.price), 0)

  return (
    <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border-t border-blue-100">
      <div className="p-8">
        {/* Header với thông tin nhanh */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {maternityDress.images && maternityDress.images.length > 0 ? (
                <DetailProductImage
                  src={maternityDress.images[0]}
                  alt={maternityDress.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-blue-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{maternityDress.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{maternityDress.id}</code></span>
                  <span>•</span>
                  <span>{maternityDressDetails.length} chi tiết</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Chi tiết đầm bầu
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all">
              <Info className="h-4 w-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all">
              <Settings className="h-4 w-4" />
              Chi tiết ({maternityDressDetails.length})
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all">
              <BarChart3 className="h-4 w-4" />
              Tồn kho
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Product Information */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Thông Tin Cơ Bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mã đầm bầu</span>
                          <p className="text-sm font-mono text-gray-900 mt-1">{maternityDress.id}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Style Name</span>
                          <p className="text-sm text-gray-900 mt-1">{maternityDress.styleName}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slug URL</span>
                          <p className="text-sm font-mono text-gray-900 mt-1">{maternityDress.slug}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Tổng chi tiết</span>
                          <p className="text-lg font-bold text-blue-700 mt-1">{maternityDressDetails.length}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Tổng tồn kho</span>
                          <p className="text-lg font-bold text-purple-700 mt-1">{totalStock}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Tổng giá trị</span>
                          <p className="text-lg font-bold text-green-700 mt-1">${totalValue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Images */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Hình Ảnh Đầm Bầu ({maternityDress.images?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {maternityDress.images && maternityDress.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {maternityDress.images.map((image: string, index: number) => (
                        <div key={index} className="relative group">
                          <DetailProductImage
                            src={image}
                            alt={`${maternityDress.name} ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-100 group-hover:border-blue-300 transition-colors"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">{index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                      <Package className="h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">Chưa có hình ảnh</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle>Mô Tả Đầm Bầu</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {maternityDress.description || (
                      <span className="text-gray-400 italic">Chưa có mô tả chi tiết cho đầm bầu này.</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Maternity Dress Details */}
          <TabsContent value="details" className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Chi Tiết Đầm Bầu ({maternityDressDetails.length})
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={createDetailMutation.isPending}
                    className="bg-white text-orange-600 hover:bg-orange-50 border border-orange-200"
                  >
                    {showAddForm ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Đóng Form
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Chi Tiết
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Add Detail Form */}
                {showAddForm && (
                  <Card className="mb-6 border-2 border-dashed border-orange-200 bg-orange-50/30">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Thêm Chi Tiết Mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddDetail)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Tên Chi Tiết *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="VD: Đầm bầu màu đỏ size M" 
                                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="color"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Màu Sắc *</FormLabel>
                                  <FormControl>
                                    <select
                                      className="w-full border border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white px-3 py-2 text-sm rounded-md"
                                      {...field}
                                    >
                                      <option value="">Chọn màu sắc</option>
                                      {colors.map((color) => (
                                        <option key={color} value={color}>
                                          {color}
                                        </option>
                                      ))}
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                              control={form.control}
                              name="size"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Kích Thước *</FormLabel>
                                  <FormControl>
                                    <select
                                      className="w-full border border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white px-3 py-2 text-sm rounded-md"
                                      {...field}
                                    >
                                      <option value="">Chọn size</option>
                                      {sizes.map((size) => (
                                        <option key={size} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="quantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Số Lượng *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="10"
                                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium">Giá *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="29.99"
                                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium">Mô Tả</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Mô tả chi tiết về phiên bản này..." 
                                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium">Hình Ảnh *</FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    maxFiles={5}
                                    placeholder="Upload hình ảnh chi tiết"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-3 pt-4 border-t border-orange-200">
                            <Button 
                              type="submit" 
                              disabled={createDetailMutation.isPending}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              {createDetailMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Đang thêm...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Thêm Chi Tiết
                                </>
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowAddForm(false)}
                              className="border-gray-300 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Hủy
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {/* Details List */}
                {maternityDressDetails.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="max-w-sm mx-auto">
                      <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chi tiết nào</h3>
                      <p className="text-gray-500 mb-6">
                        Thêm các chi tiết như màu sắc, size, giá để hoàn thiện đầm bầu và bắt đầu bán hàng
                      </p>
                      <Button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Chi Tiết Đầu Tiên
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                      <Card key={detail.id} className="relative group hover:shadow-lg transition-shadow border border-gray-200">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => handleRemoveDetail(detail.id)}
                          disabled={deleteDetailMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <CardContent className="p-0">
                          {detail.images && detail.images.length > 0 ? (
                            <DetailProductImage
                              src={detail.images[0]}
                              alt={detail.name}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 text-lg">{detail.name}</h4>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Màu sắc:</span>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {detail.color}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Kích thước:</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {detail.size}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Số lượng:</span>
                                <Badge 
                                  variant={detail.quantity > 10 ? "default" : "destructive"} 
                                  className="font-semibold"
                                >
                                  {detail.quantity}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Giá:</span>
                                <span className="font-semibold text-green-600">${detail.price}</span>
                              </div>
                            </div>
                            
                            {detail.description && (
                              <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-600 line-clamp-2">{detail.description}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Inventory Management */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Thống Kê Tồn Kho
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-blue-700">Tổng chi tiết</span>
                        <p className="text-3xl font-bold text-blue-800 mt-1">{maternityDressDetails.length}</p>
                      </div>
                      <Package className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-green-700">Tổng tồn kho</span>
                        <p className="text-3xl font-bold text-green-800 mt-1">{totalStock}</p>
                      </div>
                      <BarChart3 className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-purple-700">Giá trị tồn kho</span>
                        <p className="text-3xl font-bold text-purple-800 mt-1">${totalValue.toLocaleString()}</p>
                      </div>
                      <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-bold text-lg">$</span>
                      </div>
                    </div>
                  </div>
                </div>

                {maternityDressDetails.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Chi Tiết Tồn Kho Theo Phiên Bản</h4>
                    <div className="space-y-3">
                      {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                        <div key={detail.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-4">
                            {detail.images && detail.images.length > 0 && (
                              <DetailProductImage
                                src={detail.images[0]}
                                alt={detail.name}
                                className="w-12 h-12 rounded-lg object-cover border"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{detail.name}</p>
                              <p className="text-sm text-gray-500">{detail.color} • {detail.size} • ${detail.price}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">{detail.quantity}</p>
                            <p className="text-sm text-gray-500">đơn vị</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu tồn kho</h4>
                    <p className="text-gray-500">Thêm chi tiết đầm bầu để xem thống kê tồn kho</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 