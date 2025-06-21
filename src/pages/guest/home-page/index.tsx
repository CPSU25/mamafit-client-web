import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  Heart, 
  Star,
  Facebook,
  Instagram,
  Twitter,
  Sparkles
} from 'lucide-react'

// Mock data for products
const newCollectionProducts = [
  {
    id: 1,
    name: 'Elegant Maternity Blazer',
    price: 129.99,
    originalPrice: 159.99,
    image: '/api/placeholder/300/400',
    category: 'Formal'
  },
  {
    id: 2,
    name: 'Comfortable Casual Dress',
    price: 89.99,
    image: '/api/placeholder/300/400',
    category: 'Casual'
  },
  {
    id: 3,
    name: 'Professional Work Attire',
    price: 149.99,
    image: '/api/placeholder/300/400',
    category: 'Work'
  }
]

const bestSellerProducts = [
  {
    id: 4,
    name: 'Red Maternity Jumpsuit',
    price: 99.99,
    image: '/api/placeholder/300/400',
    rating: 4.8,
    reviews: 124
  },
  {
    id: 5,
    name: 'Neutral Maternity Dress',
    price: 79.99,
    image: '/api/placeholder/300/400',
    rating: 4.9,
    reviews: 89
  }
]

const productGridItems = {
  hot: [
    { id: 6, name: 'Nude Maternity Living Dress', price: 89.99, image: '/api/placeholder/250/350' },
    { id: 7, name: 'Black Crop Maternity Top', price: 59.99, image: '/api/placeholder/250/350' },
    { id: 8, name: 'Grey Maternity Loungewear', price: 79.99, image: '/api/placeholder/250/350' },
    { id: 9, name: 'Pink and Maternity Dress', price: 94.99, image: '/api/placeholder/250/350' }
  ],
  sale: [
    { id: 10, name: 'Sale Maternity Living Dress', price: 69.99, originalPrice: 89.99, image: '/api/placeholder/250/350' },
    { id: 11, name: 'Sale Black Crop Top', price: 39.99, originalPrice: 59.99, image: '/api/placeholder/250/350' },
    { id: 12, name: 'Sale Loungewear Set', price: 59.99, originalPrice: 79.99, image: '/api/placeholder/250/350' },
    { id: 13, name: 'Sale Maternity Dress', price: 74.99, originalPrice: 94.99, image: '/api/placeholder/250/350' }
  ],
  trending: [
    { id: 14, name: 'Trending Maxi Dress', price: 119.99, image: '/api/placeholder/250/350' },
    { id: 15, name: 'Trending Casual Set', price: 89.99, image: '/api/placeholder/250/350' },
    { id: 16, name: 'Trending Work Dress', price: 129.99, image: '/api/placeholder/250/350' },
    { id: 17, name: 'Trending Evening Wear', price: 149.99, image: '/api/placeholder/250/350' }
  ],
  new: [
    { id: 18, name: 'New Arrival Dress', price: 109.99, image: '/api/placeholder/250/350' },
    { id: 19, name: 'New Summer Top', price: 69.99, image: '/api/placeholder/250/350' },
    { id: 20, name: 'New Casual Wear', price: 89.99, image: '/api/placeholder/250/350' },
    { id: 21, name: 'New Party Dress', price: 139.99, image: '/api/placeholder/250/350' }
  ]
}

const testimonials = [
  {
    name: 'Lucy Smith',
    role: 'Customer',
    content: 'Thank God for designing new style that every maternity fashion lover wants to have.',
    avatar: '/api/placeholder/60/60'
  },
  {
    name: 'Cesca Gomez',
    role: 'Customer', 
    content: 'The perfect blend of maternity fashion that captures my style perfectly.',
    avatar: '/api/placeholder/60/60'
  },
  {
    name: 'Janelle Mana',
    role: 'Customer',
    content: 'Confit an Emerald an becoming like wardrobe thanks to fit.',
    avatar: '/api/placeholder/60/60'
  }
]

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 5,
    minutes: 10,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex gap-4 justify-center">
      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-white">{timeLeft.days.toString().padStart(2, '0')}</div>
        <div className="text-sm text-white/80">Days</div>
      </div>
      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
        <div className="text-sm text-white/80">Hours</div>
      </div>
      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</div>
        <div className="text-sm text-white/80">Min</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary">MamaFit</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">New In</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Maternity Dresses</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Activewear Clothes</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Favorites</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button>LOGIN</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 to-violet-100 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  A New Style.<br />
                  A New Life.
                </h2>
                <p className="text-lg text-gray-600 max-w-md">
                  Everyone deserves to feel fantastic during her pregnancy. Shop stylish options for every occasion, whether you're going to work or staying home.
                </p>
              </div>
              <Button size="lg" className="text-lg px-8 py-6">
                Shop Now
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-violet-200 to-purple-300 rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src="https://i.pinimg.com/736x/e9/94/ec/e994ecfac8cf57938990c9f9bd02945b.jpg" 
                  alt="Maternity Fashion Model" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Collection Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">NEW COLLECTION</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hot off the press: these trendy maternity clothes are the very latest addition to our fashionable selection.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {newCollectionProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                  <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                                     <div className="flex items-center space-x-2">
                     <span className="text-xl font-bold text-primary">${product.price}</span>
                     {'originalPrice' in product && product.originalPrice && (
                       <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                     )}
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Stats */}
      <section className="py-16 bg-violet-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Best Fashion<br />since 2010
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Here at MamaFit, we specialize in innovative maternity & nursing designs that respond to your growing body and changing needs. We blend style, comfort, and functionality to create pieces you'll love wearing throughout your pregnancy and beyond.
              </p>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">2010</div>
                  <div className="text-sm text-gray-600">Emerald Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">8960+</div>
                  <div className="text-sm text-gray-600">Product Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">3100+</div>
                  <div className="text-sm text-gray-600">Best Reviews</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-violet-200 to-purple-300 rounded-2xl overflow-hidden">
                <img 
                  src="/api/placeholder/500/500" 
                  alt="About MamaFit" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Seller Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900">Best Seller Product</h3>
            <p className="text-gray-600">20% Percent Off All Dresses</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellerProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4">Best Seller</Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating} ({product.reviews})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* Placeholder for more products */}
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">More coming soon</p>
              </div>
            </div>
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">More coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Product Grid with Tabs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Our Product</h3>
            <Tabs defaultValue="hot" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
                <TabsTrigger value="hot">HOT</TabsTrigger>
                <TabsTrigger value="sale">ON SALE</TabsTrigger>
                <TabsTrigger value="trending">TRENDING TO YOU</TabsTrigger>
                <TabsTrigger value="new">NEW ARRIVAL</TabsTrigger>
              </TabsList>
              {Object.entries(productGridItems).map(([category, products]) => (
                <TabsContent key={category} value={category} className="mt-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                                                 <CardContent className="p-4">
                           <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                           <div className="flex items-center space-x-2">
                             <span className="text-lg font-bold text-primary">${product.price}</span>
                             {'originalPrice' in product && product.originalPrice && (
                               <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                             )}
                           </div>
                         </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Deal of the Day */}
      <section className="py-16 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold">DEAL OF THE DAY</h3>
              <p className="text-lg text-white/90">
                Treat yourself to a gorgeous new maternity dress
              </p>
              <CountdownTimer />
              <Button variant="secondary" size="lg" className="text-lg px-8">
                Shop Now
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/10 backdrop-blur rounded-2xl overflow-hidden">
                <img 
                  src="/api/placeholder/400/400" 
                  alt="Deal of the day" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">WHAT PEOPLE SAY ABOUT US</h3>
            <div className="max-w-3xl mx-auto">
              <div className="bg-violet-50 rounded-2xl p-8 mb-8">
                <p className="text-lg text-gray-700 italic mb-6">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonials[currentTestimonial].avatar} />
                    <AvatarFallback>{testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                    <div className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Feature Images */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="aspect-[4/3] bg-violet-100 rounded-lg overflow-hidden">
              <img src="/api/placeholder/400/300" alt="Feature 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/3] bg-violet-100 rounded-lg overflow-hidden">
              <img src="/api/placeholder/400/300" alt="Feature 2" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/3] bg-violet-100 rounded-lg overflow-hidden">
              <img src="/api/placeholder/400/300" alt="Feature 3" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Help & Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">HELP & INFORMATION</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Contact us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Delivery Information</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Store Locator</a></li>
              </ul>
            </div>

            {/* About MamaFit */}
            <div>
              <h4 className="text-lg font-semibold mb-4">ABOUT MAMAFIT</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Advice</a></li>
                <li><a href="#" className="hover:text-white transition-colors">MamaFit Group Plc</a></li>
              </ul>
            </div>

            {/* More from MamaFit */}
            <div>
              <h4 className="text-lg font-semibold mb-4">MORE FROM MAMAFIT</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Refer a Friend</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Coupons</a></li>
                <li><a href="#" className="hover:text-white transition-colors">E-Gift Cards</a></li>
              </ul>
              
              {/* Social Media */}
              <div className="mt-6">
                <div className="flex space-x-4">
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                    <Twitter className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          <div className="text-center text-gray-300">
            <p>Copyright © 2024 MamaFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
