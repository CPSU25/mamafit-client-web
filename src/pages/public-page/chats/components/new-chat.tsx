import { useEffect, useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetListUser } from '@/services/admin/manage-user.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useCreateRoom } from '@/services/chat/chat.service'
import { ManageUserType } from '@/@types/admin.types'
import { toast } from 'sonner'

type User = {
  id: string
  username: string
  fullName: string
  profile: string
  title: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomCreated?: (roomId: string) => void
}

export function NewChat({ onOpenChange, open, onRoomCreated }: Props) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const { user: currentUser } = useAuthStore()

  // ===== REACT QUERY HOOKS =====

  // Load users from API
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetListUser({
    pageSize: 100 // Load all users
  })

  // Create room mutation
  const createRoomMutation = useCreateRoom()

  // Map ManageUserType to User format
  const users: User[] =
    usersResponse?.data?.items
      ?.map((user: ManageUserType) => ({
        id: user.id,
        username: user.userName,
        fullName: user.fullName,
        profile: user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`,
        title: user.roleName
      }))
      .filter((user: User) => user.id !== currentUser?.userId) || [] // Exclude current user

  const handleSelectUser = (user: User) => {
    // Only allow selecting one user for 1-on-1 chat
    if (selectedUsers.length === 0) {
      setSelectedUsers([user])
    } else {
      setSelectedUsers([])
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleCreateChat = async () => {
    if (!selectedUsers.length || !currentUser?.userId) return

    try {
      const selectedUser = selectedUsers[0]

      console.log('🏗️ Creating chat room via React Query...', {
        userId1: currentUser.userId,
        userId2: selectedUser.id
      })

      // Use React Query mutation instead of direct hook call
      const createdRoom = await createRoomMutation.mutateAsync({
        userId1: currentUser.userId,
        userId2: selectedUser.id
      })

      console.log('✅ Room created successfully:', createdRoom)
      toast.success(`Chat room created with ${selectedUser.fullName}`)

      // Auto-select the newly created room
      if (onRoomCreated && createdRoom.id) {
        onRoomCreated(createdRoom.id)
      }

      onOpenChange(false) // Close dialog
      setSelectedUsers([]) // Reset selection
    } catch (error) {
      console.error('❌ Failed to create room:', error)

      // Extract specific error message
      let errorMessage = 'Failed to create chat room. Please try again.'

      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'You are not authorized to create a chat with this user.'
        } else if (error.message.includes('Invalid user')) {
          errorMessage = 'Invalid user selected. Please try again.'
        } else if (error.message.includes('Connection')) {
          errorMessage = 'Connection error. Please check your internet and try again.'
        } else if (error.message.includes('already exists')) {
          errorMessage = 'A chat room with this user already exists.'
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedUsers([])
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant='default'>
                {user.fullName}
                <button
                  className='ring-offset-background focus:ring-ring ml-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveUser(user.id)
                    }
                  }}
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
          <Command className='rounded-lg border'>
            <CommandInput placeholder='Search people...' className='text-foreground' />
            <CommandList>
              {isLoadingUsers ? (
                <div className='flex items-center justify-center p-4'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='ml-2 text-sm text-muted-foreground'>Loading users...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>No people found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user)}
                        className='flex items-center justify-between gap-2'
                      >
                        <div className='flex items-center gap-2'>
                          <img
                            src={user.profile || '/placeholder.svg'}
                            alt={user.fullName}
                            className='h-8 w-8 rounded-full'
                          />
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium'>{user.fullName}</span>
                            <span className='text-muted-foreground text-xs'>
                              @{user.username} • {user.title}
                            </span>
                          </div>
                        </div>

                        {selectedUsers.find((u) => u.id === user.id) && <Check className='h-4 w-4' />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
          <Button
            variant={'default'}
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0 || createRoomMutation.isPending}
          >
            {createRoomMutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Creating...
              </>
            ) : (
              'Start Chat'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
