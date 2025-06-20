import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { signalRService } from '@/services/chat/signalr.service'

export const useSignalRAutoConnect = () => {
  const { isAuthenticated, user } = useAuthStore()
  const hasTriedConnect = useRef(false) 

  useEffect(() => {
    let isComponentMounted = true

    const handleSignalRConnection = async () => {
      if (isAuthenticated && user) {
        if (!hasTriedConnect.current || !signalRService.isConnected) {
          try {            
            if (!signalRService.isConnected) {
              await signalRService.connect()
              hasTriedConnect.current = true
              console.log('✅ SignalR auto-connected after login')
            } else {
              console.log('⏭️ SignalR already connected')
            }
          } catch (error) {
            console.error('❌ Failed to auto-connect SignalR after login:', error)
            hasTriedConnect.current = false 
          }
        }
      } else {
        try {
          if (signalRService.isConnected) {
            console.log('🔒 User logged out, disconnecting from SignalR...')
            await signalRService.disconnect()
            hasTriedConnect.current = false 
          }
        } catch (error) {
          console.error('❌ Failed to disconnect SignalR after logout:', error)
        }
      }
    }

    if (isComponentMounted) {
      handleSignalRConnection()
    }
    return () => {
      isComponentMounted = false
    }
  }, [isAuthenticated, user?.userId]) 

  return {
    isConnected: signalRService.isConnected,
    connectionState: signalRService.connectionState
  }
} 