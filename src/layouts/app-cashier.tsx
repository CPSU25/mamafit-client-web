import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Plus, Minus, ShoppingCart, User, CreditCard } from 'lucide-react'

// Mock data
const mockOrders = [
  { id: 1, status: 'Payment', customer: 'Jane Doe', total: 149.99 },
  { id: 2, status: 'Shipment', customer: 'John Smith', total: 299.5 },
  { id: 3, status: 'Payment', customer: 'Alice Johnson', total: 89.99 }
]

const mockProducts: MaternityDress[] = [
  {
    id: 1,
    name: 'Maternity Yoga Pants',
    price: 89.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Activewear'
  },
  {
    id: 2,
    name: 'Nursing Friendly Blouse',
    price: 69.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Tops'
  },
  {
    id: 3,
    name: 'Pregnancy Support Belt',
    price: 49.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Accessories'
  },
  {
    id: 4,
    name: 'Maternity Dress',
    price: 129.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Dresses'
  },
  {
    id: 5,
    name: 'Postpartum Leggings',
    price: 79.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Activewear'
  },
  {
    id: 6,
    name: 'Nursing Bra',
    price: 39.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Intimates'
  },
  {
    id: 7,
    name: 'Maternity Jeans',
    price: 99.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Bottoms'
  },
  {
    id: 8,
    name: 'Baby Carrier',
    price: 159.99,
    image: '/images/mamafit-splash-screen.png',
    sizes: ['One Size'],
    category: 'Accessories'
  }
]

interface MaternityDress {
  id: number
  name: string
  price: number
  image: string
  sizes: string[]
  category: string
}

interface CartItem {
  id: number
  name: string
  price: number
  size: string
  quantity: number
  image: string
}

function POSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [membershipId, setMembershipId] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({})

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: MaternityDress) => {
    const selectedSize = selectedSizes[product.id] || product.sizes[0]
    const existingItem = cart.find((item) => item.id === product.id && item.size === selectedSize)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.size === selectedSize ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          size: selectedSize,
          quantity: 1,
          image: product.image
        }
      ])
    }
  }

  const updateQuantity = (id: number, size: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id && item.size === size) {
            const newQuantity = Math.max(0, item.quantity + change)
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const membershipDiscount = membershipId ? subtotal * 0.1 : 0
  const tax = (subtotal - membershipDiscount) * 0.08
  const total = subtotal - membershipDiscount + tax

  return (
    <div className='min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto'>
        {/* Left Section - Products */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Status Bar */}
          <Card className='border-pink-100 shadow-lg bg-white/80 backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                <ShoppingCart className='h-5 w-5 text-pink-600' />
                Online Transaction Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-3'>
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className='flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-100'
                  >
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Payment' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className='text-sm text-gray-600'>{order.customer}</span>
                    <span className='text-sm font-medium text-gray-800'>${order.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search and Products */}
          <Card className='border-pink-100 shadow-lg bg-white/80 backdrop-blur-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-4'>
              <CardTitle className='text-lg font-semibold text-gray-800'>Products</CardTitle>
              <div className='relative w-64'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search products...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-200'
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className='border-pink-100 hover:shadow-md transition-shadow bg-gradient-to-b from-white to-pink-50/30'
                  >
                    <CardContent className='p-4'>
                      <div className='aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center'>
                        <img src={product.image} alt={product.name} className='w-12 h-12 object-contain opacity-80' />
                      </div>
                      <h3 className='font-medium text-sm text-gray-800 mb-2 line-clamp-2'>{product.name}</h3>
                      <p className='text-lg font-semibold text-pink-600 mb-3'>${product.price}</p>

                      {/* Size Selector */}
                      <div className='mb-3'>
                        <label className='text-xs text-gray-600 mb-1 block'>Size:</label>
                        <div className='flex gap-1'>
                          {product.sizes.map((size) => (
                            <Button
                              key={size}
                              variant={selectedSizes[product.id] === size ? 'default' : 'outline'}
                              size='sm'
                              className={`h-8 px-2 text-xs ${
                                selectedSizes[product.id] === size
                                  ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                  : 'border-pink-200 text-pink-600 hover:bg-pink-50'
                              }`}
                              onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        className='w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                        size='sm'
                      >
                        <Plus className='h-4 w-4 mr-1' />
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Order Details */}
        <div className='lg:col-span-4'>
          <Card className='border-pink-100 shadow-lg bg-white/90 backdrop-blur-sm sticky top-6'>
            <CardHeader className='bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg'>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-6'>
              {/* Customer Info */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <User className='h-4 w-4 text-pink-600' />
                  Customer Information
                </div>
                <div className='space-y-3'>
                  <Input
                    placeholder='Customer Name'
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className='border-pink-200 focus:border-pink-400 focus:ring-pink-200'
                  />
                  <Input
                    placeholder='Membership ID (optional)'
                    value={membershipId}
                    onChange={(e) => setMembershipId(e.target.value)}
                    className='border-pink-200 focus:border-pink-400 focus:ring-pink-200'
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-700'>Selected Items ({cart.length})</h3>
                <ScrollArea className='h-64 pr-4'>
                  <div className='space-y-3'>
                    {cart.length === 0 ? (
                      <div className='text-center py-8 text-gray-500'>
                        <ShoppingCart className='h-8 w-8 mx-auto mb-2 opacity-50' />
                        <p className='text-sm'>No items in cart</p>
                      </div>
                    ) : (
                      cart.map((item, index) => (
                        <div
                          key={`${item.id}-${item.size}-${index}`}
                          className='flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100'
                        >
                          <div className='w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0'>
                            <img src={item.image} alt={item.name} className='w-8 h-8 object-contain' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-800 truncate'>{item.name}</p>
                            <p className='text-xs text-gray-600'>Size: {item.size}</p>
                            <p className='text-sm font-semibold text-pink-600'>${item.price}</p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-8 w-8 border-pink-200 text-pink-600 hover:bg-pink-50'
                              onClick={() => updateQuantity(item.id, item.size, -1)}
                            >
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='w-8 text-center text-sm font-medium'>{item.quantity}</span>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-8 w-8 border-pink-200 text-pink-600 hover:bg-pink-50'
                              onClick={() => updateQuantity(item.id, item.size, 1)}
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Order Summary */}
              <div className='space-y-3 pt-4 border-t border-pink-100'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal:</span>
                  <span className='font-medium'>${subtotal.toFixed(2)}</span>
                </div>
                {membershipDiscount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-green-600'>Membership Discount (10%):</span>
                    <span className='font-medium text-green-600'>-${membershipDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Tax (8%):</span>
                  <span className='font-medium'>${tax.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-lg font-bold pt-2 border-t border-pink-200'>
                  <span>Total:</span>
                  <span className='text-pink-600'>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Process Transaction Button */}
              <Button
                className='w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 text-lg font-semibold'
                disabled={cart.length === 0}
              >
                <CreditCard className='h-5 w-5 mr-2' />
                Process Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default POSPage
