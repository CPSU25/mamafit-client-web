import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { notificationSignalRService, TaskUpdatedData } from '@/services/notification/notification-signalr.service'
import { toast } from 'sonner'

/**
 * Hook để xử lý TaskUpdated events từ SignalR
 * Tự động invalidate queries và show notifications cho task progress updates
 */
export const useTaskUpdates = () => {
  const queryClient = useQueryClient()
  const listenerSetup = useRef(false)

  /**
   * Optimistically update order cache với task data mới
   */
  const updateOrderCache = useCallback((taskData: TaskUpdatedData) => {
    console.log('🔄 [TaskUpdates] Optimistically updating order cache...')
    
    // Update specific order cache
    queryClient.setQueryData(['orders', taskData.OrderId], (oldOrder: unknown) => {
      if (!oldOrder || typeof oldOrder !== 'object') return oldOrder

      const order = oldOrder as Record<string, unknown>
      console.log('📝 [TaskUpdates] Updating order cache for:', taskData.OrderId)
      
      return {
        ...order,
        lastUpdated: taskData.UpdatedAt,
        // Update order items if available
        orderItems: Array.isArray(order.orderItems) 
          ? order.orderItems.map((item: unknown) => {
              if (typeof item === 'object' && item !== null) {
                const orderItem = item as Record<string, unknown>
                return orderItem.id === taskData.OrderItemId 
                  ? { 
                      ...orderItem, 
                      lastTaskUpdate: taskData.UpdatedAt, 
                      currentStatus: taskData.Status,
                      currentTaskName: taskData.TaskName,
                      currentMilestone: taskData.MilestoneName
                    }
                  : orderItem
              }
              return item
            })
          : order.orderItems
      }
    })

    // Update orders list cache
    queryClient.setQueryData(['orders'], (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData

      const data = oldData as Record<string, unknown>
      const dataObj = data.data as Record<string, unknown>
      
      if (!dataObj?.items || !Array.isArray(dataObj.items)) return oldData

      return {
        ...data,
        data: {
          ...dataObj,
          items: dataObj.items.map((order: unknown) => {
            if (typeof order === 'object' && order !== null) {
              const orderObj = order as Record<string, unknown>
              return orderObj.id === taskData.OrderId
                ? {
                    ...orderObj,
                    lastUpdated: taskData.UpdatedAt,
                    latestTaskStatus: taskData.Status,
                    latestTaskName: taskData.TaskName
                  }
                : orderObj
            }
            return order
          })
        }
      }
    })
  }, [queryClient])

  /**
   * Format task status thành message tiếng Việt
   */
  const getStatusMessage = useCallback((status: string): string => {
    const statusMap: Record<string, string> = {
      'STARTED': 'đã bắt đầu',
      'IN_PROGRESS': 'đang thực hiện', 
      'COMPLETED': 'đã hoàn thành',
      'PAUSED': 'tạm dừng',
      'CANCELLED': 'đã hủy',
      'PENDING': 'chờ xử lý',
      'REVIEWING': 'đang kiểm tra',
      'APPROVED': 'đã duyệt',
      'REJECTED': 'bị từ chối'
    }
    return statusMap[status] || status.toLowerCase()
  }, [])

  useEffect(() => {
    if (listenerSetup.current) return
    listenerSetup.current = true

    console.log('📋 [TaskUpdates] Setting up TaskUpdated listener...')

    const handleTaskUpdated = (taskData: TaskUpdatedData) => {
      console.log('📋 [TaskUpdates] TaskUpdated received:', taskData)

      // 1. Invalidate related queries to refetch fresh data
      console.log('🔄 [TaskUpdates] Invalidating related queries...')
      
      // Invalidate order-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['orders', taskData.OrderId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['order-items', taskData.OrderItemId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['orders'] // All orders list
      })
      
      // Invalidate task-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['tasks'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['admin-tasks'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['staff-tasks'] 
      })
      
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'dashboard'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard'] 
      })

      // 2. Show detailed toast for task progress
      const statusMessage = getStatusMessage(taskData.Status)
      toast.success(`${taskData.TaskName} - ${statusMessage}`, {
        description: `${taskData.ProductName} (${taskData.OrderCode})`,
        action: {
          label: 'Xem đơn hàng',
          onClick: () => {
            // Navigate to order detail based on current user role
            const currentPath = window.location.pathname
            let targetUrl = `/system/admin/manage-order/${taskData.OrderId}`
            
            if (currentPath.includes('/system/branch/')) {
              targetUrl = `/system/branch/manage-order/${taskData.OrderId}`
            } else if (currentPath.includes('/system/manager/')) {
              targetUrl = `/system/manager/manage-order/${taskData.OrderId}`
            } else if (currentPath.includes('/system/staff/')) {
              targetUrl = `/system/staff/order-item/${taskData.OrderItemId}`
            }
            
            window.location.href = targetUrl
          }
        },
        duration: 8000
      })

      // 3. Optionally update specific cache data optimistically
      updateOrderCache(taskData)
    }

    // Setup listener
    notificationSignalRService.on('TaskUpdated', handleTaskUpdated)

    return () => {
      console.log('🧹 [TaskUpdates] Cleaning up TaskUpdated listener')
      notificationSignalRService.off('TaskUpdated', handleTaskUpdated)
      listenerSetup.current = false
    }
  }, [queryClient, updateOrderCache, getStatusMessage])
}
