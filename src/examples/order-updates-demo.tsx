import React from 'react'
import { 
  useOrderUpdates, 
  useUnifiedHubConnection,
  type OrderStatusChangedEvent,
  type PaymentReceivedEvent
} from '@/services/signalr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Package, 
  CreditCard, 
  Wifi, 
  WifiOff,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle
} from 'lucide-react'

export default function OrderUpdatesDemo() {
  const [orderId, setOrderId] = React.useState('4951106889514ce2ada27665d3e41a43')
  const [monitoringOrderId, setMonitoringOrderId] = React.useState('')
  
  // Connection status
  const { isConnected } = useUnifiedHubConnection()
  
  // Order updates for specific order
  const { lastOrderUpdate, lastPayment } = useOrderUpdates(monitoringOrderId, {
    onStatusChange: (event: OrderStatusChangedEvent) => {
      console.log('📦 Order status changed:', event)
    },
    onPaymentReceived: (event: PaymentReceivedEvent) => {
      console.log('💰 Payment received:', event)
    }
  })

  const startMonitoring = () => {
    setMonitoringOrderId(orderId)
  }

  const stopMonitoring = () => {
    setMonitoringOrderId('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PROCESSING':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'MANUFACTURING':
        return <Package className="h-4 w-4 text-purple-500" />
      case 'QUALITY_CHECK':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'READY_FOR_DELIVERY':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-800'
      case 'MANUFACTURING':
        return 'bg-purple-100 text-purple-800'
      case 'QUALITY_CHECK':
        return 'bg-yellow-100 text-yellow-800'
      case 'READY_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Updates Demo</h1>
          <p className="text-muted-foreground">
            Real-time order status và payment updates từ UnifiedHub
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Monitor Order</CardTitle>
            <CardDescription>
              Nhập Order ID để theo dõi real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order ID</label>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Nhập Order ID để monitor..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={startMonitoring}
                disabled={!orderId || monitoringOrderId === orderId}
                className="flex-1"
              >
                {monitoringOrderId === orderId ? 'Đang Monitor' : 'Start Monitor'}
              </Button>
              <Button 
                onClick={stopMonitoring}
                variant="outline"
                disabled={!monitoringOrderId}
              >
                Stop
              </Button>
            </div>

            {monitoringOrderId && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Đang monitor:</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {monitoringOrderId}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
            <CardDescription>
              Cập nhật mới nhất từ order đang monitor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!monitoringOrderId && (
              <div className="text-center text-muted-foreground py-8">
                Chưa monitor order nào. Nhập Order ID và click "Start Monitor"
              </div>
            )}

            {monitoringOrderId && !lastOrderUpdate && !lastPayment && (
              <div className="text-center text-muted-foreground py-8">
                Đang chờ updates cho order {monitoringOrderId}...
              </div>
            )}

            {lastOrderUpdate && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Order Status Update</span>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Order:</span>
                    <span className="font-mono text-sm">{lastOrderUpdate.orderId}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lastOrderUpdate.newStatus)}
                      <Badge className={getStatusColor(lastOrderUpdate.newStatus)}>
                        {lastOrderUpdate.newStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Previous:</span>
                    <Badge variant="outline">
                      {lastOrderUpdate.oldStatus}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Updated:</span>
                    <span className="text-sm">
                      {new Date(lastOrderUpdate.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  {lastOrderUpdate.customerMessage && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground mb-1">Message:</div>
                      <div className="text-sm">{lastOrderUpdate.customerMessage}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {lastPayment && (
              <>
                {lastOrderUpdate && <Separator />}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Payment Received</span>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-medium text-green-700">
                        {lastPayment.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Method:</span>
                      <Badge variant="outline">
                        {lastPayment.paymentMethod}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm">{lastPayment.customerName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Received:</span>
                      <span className="text-sm">
                        {new Date(lastPayment.receivedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn Test</CardTitle>
          <CardDescription>
            Cách để test real-time order updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Kết nối UnifiedHub</h4>
            <p className="text-sm text-muted-foreground">
              Đảm bảo đã đăng nhập và UnifiedHub đã connected (status phía trên góc phải).
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Monitor Order</h4>
            <p className="text-sm text-muted-foreground">
              Nhập Order ID (mặc định: 4951106889514ce2ada27665d3e41a43) và click "Start Monitor".
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Trigger Backend Event</h4>
            <p className="text-sm text-muted-foreground">
              Từ backend, gửi SignalR event với format: 
            </p>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "type": 1,
  "target": "RealtimeEvent", 
  "arguments": [{
    "orderId": "4951106889514ce2ada27665d3e41a43",
    "eventType": "order.status.changed",
    "data": {
      "orderId": "4951106889514ce2ada27665d3e41a43", 
      "oldStatus": "CREATED",
      "newStatus": "CONFIRMED"
    }
  }]
}`}
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">4. Xem Updates</h4>
            <p className="text-sm text-muted-foreground">
              UI sẽ tự động update real-time khi nhận được event từ backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
