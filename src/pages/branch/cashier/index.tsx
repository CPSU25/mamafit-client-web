import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Plus, Minus, ShoppingCart, User, CreditCard, Package, Truck, CheckCircle, X } from 'lucide-react'

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

function CashierPage() {
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

  const removeFromCart = (id: number, size: string) => {
    setCart(cart.filter((item) => !(item.id === id && item.size === size)))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const membershipDiscount = membershipId ? subtotal * 0.1 : 0
  const tax = (subtotal - membershipDiscount) * 0.08
  const total = subtotal - membershipDiscount + tax

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Payment':
        return <CreditCard className='h-4 w-4' />
      case 'Shipment':
        return <Truck className='h-4 w-4' />
      case 'Completed':
        return <CheckCircle className='h-4 w-4' />
      default:
        return <Package className='h-4 w-4' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payment':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Shipment':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header Section */}
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>Point of Sale</h1>
            <p className='text-muted-foreground'>Manage in-store transactions and inventory</p>
          </div>
        </div>

        {/* Online Orders Status */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShoppingCart className='h-5 w-5 text-primary' />
              Online Transaction Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-3'>
              {mockOrders.map((order) => (
                <div key={order.id} className='flex items-center gap-3 bg-muted/50 p-4 rounded-lg border'>
                  <Badge variant='outline' className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className='ml-1'>{order.status}</span>
                  </Badge>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3'>
                    <span className='text-sm font-medium'>{order.customer}</span>
                    <span className='text-lg font-semibold text-primary'>${order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0'>
        {/* Products Section */}
        <div className='xl:col-span-2 space-y-6'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search products by name or category...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 h-11'
            />
          </div>

          {/* Products Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredProducts.map((product) => (
              <Card key={product.id} className='group hover:shadow-md transition-all duration-200'>
                <CardContent className='p-4'>
                  {/* Product Image */}
                  <div className='aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden'>
                    <img
                      src={product.image}
                      alt={product.name}
                      className='w-16 h-16 object-contain opacity-80 group-hover:scale-110 transition-transform duration-200'
                    />
                  </div>

                  {/* Product Info */}
                  <div className='space-y-3'>
                    <div>
                      <h3 className='font-semibold text-sm line-clamp-2 min-h-[2.5rem]'>{product.name}</h3>
                      <Badge variant='secondary' className='text-xs mt-1'>
                        {product.category}
                      </Badge>
                    </div>

                    <p className='text-xl font-bold text-primary'>${product.price}</p>

                    {/* Size Selector */}
                    <div>
                      <label className='text-xs font-medium text-muted-foreground mb-2 block'>Size:</label>
                      <div className='flex gap-1 flex-wrap'>
                        {product.sizes.map((size) => (
                          <Button
                            key={size}
                            variant={selectedSizes[product.id] === size ? 'default' : 'outline'}
                            size='sm'
                            className='h-8 px-3 text-xs'
                            onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button onClick={() => addToCart(product)} className='w-full' size='sm'>
                      <Plus className='h-4 w-4 mr-2' />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart/Order Details Section */}
        <div className='xl:col-span-1'>
          <Card className='sticky top-6 h-fit'>
            <CardHeader className='bg-primary text-primary-foreground rounded-t-xl'>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Customer Information */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <User className='h-4 w-4 text-primary' />
                  Customer Information
                </div>
                <div className='space-y-3'>
                  <Input
                    placeholder='Customer Name'
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder='Membership ID (optional)'
                    value={membershipId}
                    onChange={(e) => setMembershipId(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Cart Items */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold'>Cart Items</h3>
                  <Badge variant='secondary'>{cart.length} items</Badge>
                </div>

                <ScrollArea className='h-64'>
                  <div className='space-y-3 pr-4'>
                    {cart.length === 0 ? (
                      <div className='text-center py-8 text-muted-foreground'>
                        <ShoppingCart className='h-12 w-12 mx-auto mb-3 opacity-50' />
                        <p className='text-sm'>No items in cart</p>
                        <p className='text-xs'>Add products to get started</p>
                      </div>
                    ) : (
                      cart.map((item, index) => (
                        <div
                          key={`${item.id}-${item.size}-${index}`}
                          className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'
                        >
                          {/* Product Image */}
                          <div className='w-12 h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0'>
                            <img src={item.image} alt={item.name} className='w-8 h-8 object-contain' />
                          </div>

                          {/* Product Details */}
                          <div className='flex-1 min-w-0 space-y-1'>
                            <h4 className='text-sm font-medium truncate'>{item.name}</h4>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {item.size}
                              </Badge>
                              <span className='text-sm font-semibold text-primary'>${item.price}</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className='flex items-center gap-2 mt-2'>
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                onClick={() => updateQuantity(item.id, item.size, -1)}
                              >
                                <Minus className='h-3 w-3' />
                              </Button>
                              <span className='w-8 text-center text-sm font-medium'>{item.quantity}</span>
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                onClick={() => updateQuantity(item.id, item.size, 1)}
                              >
                                <Plus className='h-3 w-3' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 text-destructive hover:text-destructive ml-auto'
                                onClick={() => removeFromCart(item.id, item.size)}
                              >
                                <X className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold'>Order Summary</h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Subtotal:</span>
                    <span className='font-medium'>${subtotal.toFixed(2)}</span>
                  </div>
                  {membershipDiscount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Membership Discount (10%):</span>
                      <span className='font-medium'>-${membershipDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tax (8%):</span>
                    <span className='font-medium'>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between text-lg font-bold'>
                    <span>Total:</span>
                    <span className='text-primary'>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Process Transaction Button */}
              <Button className='w-full h-12 text-base font-semibold' disabled={cart.length === 0} size='lg'>
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

export default CashierPage
