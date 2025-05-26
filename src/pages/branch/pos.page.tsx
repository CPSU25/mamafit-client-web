import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    price: 100,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'Product 2',
    price: 200,
    image: 'https://via.placeholder.com/150',
  },
  // Add more mock products
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Products List */}
      <Card className="flex-1 p-4">
        <h2 className="mb-4 text-2xl font-bold">Products</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-3 gap-4">
            {mockProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer p-4 hover:bg-accent"
                onClick={() => addToCart(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="mb-2 h-32 w-full object-cover"
                />
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${product.price}
                </p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Cart */}
      <Card className="w-96 p-4">
        <h2 className="mb-4 text-2xl font-bold">Cart</h2>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {cart.map((item) => (
            <div
              key={item.id}
              className="mb-4 flex items-center justify-between rounded-lg border p-2"
            >
              <div className="flex items-center gap-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 object-cover"
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="mt-4 border-t pt-4">
          <div className="mb-4 flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${total}</span>
          </div>

          <Tabs defaultValue="cash" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cash">Cash</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
            </TabsList>
            <TabsContent value="cash">
              <div className="space-y-4">
                <Input type="number" placeholder="Enter amount" />
                <Button className="w-full">Process Payment</Button>
              </div>
            </TabsContent>
            <TabsContent value="qr">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QrCode className="h-32 w-32" />
                </div>
                <Button className="w-full">Show QR Code</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
} 