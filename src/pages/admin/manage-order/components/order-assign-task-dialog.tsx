// import { OrderItemById, AssignCharge } from '@/@types/manage-order.types'
// import { ManageUserType } from '@/@types/admin.types'

// // Define types for API response structure
// interface TaskDetail {
//   image: string | null
//   note: string | null
//   chargeId: string | null
//   chargeName: string | null
//   status: string
//   createdAt: string
//   createdBy: string
//   updatedBy: string
//   updatedAt: string | null
// }

// interface TaskWithDetail {
//   id: string
//   name: string
//   description: string
//   sequenceOrder: number
//   createdAt: string
//   createdBy: string
//   updatedAt: string
//   updatedBy: string | null
//   detail: TaskDetail
// }

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import { Label } from '@/components/ui/label'
// import { Badge } from '@/components/ui/badge'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Separator } from '@/components/ui/separator'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { useState, useEffect } from 'react'
// import { Package, User, Users, CheckCircle } from 'lucide-react'
// import { useGetListUser } from '@/services/admin/manage-user.service'
// import { useAssignCharge } from '@/services/admin/manage-order.service'
// import { useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'

// interface OrderAssignChargeDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   orderItem: OrderItemById | null
//   onSuccess?: () => void
// }

// export function OrderAssignChargeDialog({ open, onOpenChange, orderItem, onSuccess }: OrderAssignChargeDialogProps) {
//   const [selectedCharges, setSelectedCharges] = useState<Record<string, string>>({})
//   const queryClient = useQueryClient()

//   // Fetch users with Designer and Staff roles
//   const { data: designersData, isLoading: isLoadingDesigners } = useGetListUser({
//     roleName: 'Designer',
//     pageSize: 100 // Get more users
//   })
//   const { data: staffData, isLoading: isLoadingStaff } = useGetListUser({
//     roleName: 'Staff',
//     pageSize: 100 // Get more users
//   })

//   const assignChargeMutation = useAssignCharge()

//   useEffect(() => {
//     // Reset selections when dialog opens
//     if (open) {
//       setSelectedCharges({})
//     }
//   }, [open])

//   // Combine designers and staff
//   const availableUsers: ManageUserType[] = [
//     ...(Array.isArray(designersData?.data?.items) ? designersData.data.items : []),
//     ...(Array.isArray(staffData?.data?.items) ? staffData.data.items : [])
//   ]

//   const isLoadingUsers = isLoadingDesigners || isLoadingStaff

//   // Debug logging
//   console.log('Designers data:', designersData)
//   console.log('Staff data:', staffData)
//   console.log('Designers data.data.items:', designersData?.data?.items)
//   console.log('Staff data.data.items:', staffData?.data?.items)
//   console.log('Available users:', availableUsers)
//   console.log('Is loading users:', isLoadingUsers)

//   if (!orderItem) return null

//   const milestones = (
//     Array.isArray(orderItem.milestones) ? orderItem.milestones : [orderItem.milestones].filter(Boolean)
//   ).sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
//   console.log('Milestones:', milestones)

//   const handleChargeSelect = (milestoneId: string, chargeId: string) => {
//     // Only allow selection for unassigned milestones
//     const milestone = milestones.find((m) => m.id === milestoneId)
//     const hasAssignedCharge = milestone?.tasks?.some(
//       (task: TaskWithDetail) => task.detail?.chargeId && task.detail?.chargeName
//     )

//     if (hasAssignedCharge) {
//       toast.error('Milestone này đã được giao việc rồi')
//       return
//     }

//     setSelectedCharges((prev) => ({
//       ...prev,
//       [milestoneId]: chargeId
//     }))
//   }

//   const handleSubmit = async () => {
//     const assignments = Object.entries(selectedCharges)

//     if (assignments.length === 0) {
//       toast.error('Vui lòng chọn ít nhất một người thực hiện')
//       return
//     }

//     try {
//       // Create array of assignments for single API call
//       const assignmentsList: AssignCharge[] = assignments.map(([milestoneId, chargeId]) => ({
//         chargeId,
//         orderItemIds: [orderItem.id],
//         milestoneId
//       }))

//       // Send single API call with all assignments
//       await assignChargeMutation.mutateAsync(assignmentsList)

//       toast.success(`Đã giao thành công ${assignments.length} milestone`)

//       // Invalidate related queries to refetch data
//       queryClient.invalidateQueries({ queryKey: ['orders', 'detail'] })
//       queryClient.invalidateQueries({ queryKey: ['orders', 'list'] })

//       onOpenChange(false)
//       setSelectedCharges({})
//       onSuccess?.()
//     } catch (error) {
//       console.error('Error assigning charges:', error)
//       toast.error('Có lỗi xảy ra khi giao việc')
//     }
//   }

//   const handleCancel = () => {
//     setSelectedCharges({})
//     onOpenChange(false)
//   }

//   const getUserById = (userId: string) => {
//     return availableUsers.find((user) => user.id === userId)
//   }

//   // Count only unassigned milestones that are selected
//   const selectedCount = Object.keys(selectedCharges).length
//   const isSubmitting = assignChargeMutation.isPending

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
//         <DialogHeader>
//           <DialogTitle className='flex items-center space-x-2'>
//             <Package className='h-5 w-5 text-blue-600' />
//             <span>Giao việc cho Order Item</span>
//           </DialogTitle>
//         </DialogHeader>

//         <div className='space-y-6'>
//           {/* Order Item Summary */}
//           <Card>
//             <CardHeader className='pb-3'>
//               <CardTitle className='text-sm'>Thông tin Order Item</CardTitle>
//             </CardHeader>
//             <CardContent className='space-y-2'>
//               <div className='grid grid-cols-2 gap-4 text-sm'>
//                 <div>
//                   <span className='text-muted-foreground'>Loại:</span>
//                   <Badge variant='secondary' className='ml-2'>
//                     {orderItem.itemType}
//                   </Badge>
//                 </div>
//                 <div>
//                   <span className='text-muted-foreground'>Giá:</span>
//                   <span className='ml-2 font-medium'>
//                     {new Intl.NumberFormat('vi-VN', {
//                       style: 'currency',
//                       currency: 'VND'
//                     }).format(orderItem.price)}
//                   </span>
//                 </div>
//                 <div>
//                   <span className='text-muted-foreground'>Số lượng:</span>
//                   <span className='ml-2 font-medium'>{orderItem.quantity}</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Design Request Info */}
//           {orderItem.designRequest && (
//             <Card>
//               <CardHeader className='pb-3'>
//                 <CardTitle className='text-sm'>Yêu cầu thiết kế</CardTitle>
//               </CardHeader>
//               <CardContent className='space-y-2'>
//                 <p className='text-sm'>{orderItem.designRequest.description}</p>
//                 {orderItem.designRequest.images?.length > 0 && (
//                   <div className='space-y-2'>
//                     <span className='text-xs text-muted-foreground'>Hình ảnh tham khảo:</span>
//                     <div className='flex flex-wrap gap-2'>
//                       {orderItem.designRequest.images.map((image, index) => (
//                         <img
//                           key={index}
//                           src={image}
//                           alt={`Reference ${index + 1}`}
//                           className='w-16 h-16 object-cover rounded border'
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}

//           {/* Milestone Assignment */}
//           <div className='space-y-4'>
//             <div className='flex items-center justify-between'>
//               <Label className='text-base font-medium'>Giao việc cho Milestones</Label>
//               <div className='flex items-center space-x-2'>
//                 <Users className='h-4 w-4' />
//                 <span className='text-sm text-muted-foreground'>
//                   {isLoadingUsers ? 'Đang tải danh sách...' : `${availableUsers.length} người có thể được giao việc`}
//                 </span>
//               </div>
//             </div>

//             <div className='space-y-4'>
//               {milestones.map((milestone) => (
//                 <Card key={milestone.id} className='border-l-4 border-l-blue-500'>
//                   <CardContent className='p-4'>
//                     <div className='space-y-4'>
//                       {/* Milestone Header */}
//                       <div className='flex items-start justify-between'>
//                         <div className='space-y-1'>
//                           <div className='flex items-center space-x-2'>
//                             <h4 className='font-medium'>
//                               {milestone.sequenceOrder}. {milestone.name}
//                             </h4>
//                             <Badge variant='outline' className='text-xs'>
//                               {milestone.tasks?.length || 0} nhiệm vụ
//                             </Badge>
//                           </div>
//                           <p className='text-sm text-muted-foreground'>{milestone.description}</p>
//                         </div>
//                       </div>

//                       {/* Tasks List */}
//                       {milestone.tasks && milestone.tasks.length > 0 && (
//                         <div className='space-y-2'>
//                           <Separator />
//                           <div className='space-y-2'>
//                             <h5 className='text-sm font-medium text-muted-foreground'>Các nhiệm vụ:</h5>
//                             {milestone.tasks.map((task: TaskWithDetail) => (
//                               <div key={task.id} className='flex items-center justify-between text-sm pl-4'>
//                                 <div className='flex items-center space-x-2'>
//                                   <CheckCircle className='h-3 w-3 text-green-500' />
//                                   <span>{task.name}</span>
//                                 </div>
//                                 <div className='flex items-center space-x-2'>
//                                   <Badge
//                                     variant={task.detail?.status === 'PENDING' ? 'secondary' : 'default'}
//                                     className='text-xs'
//                                   >
//                                     {task.detail?.status || 'PENDING'}
//                                   </Badge>
//                                   {task.detail?.chargeName && (
//                                     <Badge variant='outline' className='text-xs'>
//                                       {task.detail.chargeName}
//                                     </Badge>
//                                   )}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Charge Assignment - Only show if milestone is not already assigned */}
//                       {(() => {
//                         // Check if any task in this milestone already has a charge assigned
//                         const hasAssignedCharge = milestone.tasks?.some(
//                           (task: TaskWithDetail) => task.detail?.chargeId && task.detail?.chargeName
//                         )

//                         if (hasAssignedCharge) {
//                           // Show assigned charge info instead of assignment dropdown
//                           const assignedTask = milestone.tasks?.find(
//                             (task: TaskWithDetail) => task.detail?.chargeId && task.detail?.chargeName
//                           )
//                           return (
//                             <div className='space-y-2'>
//                               <Separator />
//                               <div className='bg-blue-50 border border-blue-200 rounded p-3'>
//                                 <div className='flex items-center space-x-2 text-sm text-blue-800'>
//                                   <CheckCircle className='h-4 w-4' />
//                                   <span>
//                                     Đã được giao cho: <strong>{assignedTask?.detail?.chargeName}</strong>
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           )
//                         }

//                         // Show assignment dropdown for unassigned milestones
//                         return (
//                           <div className='space-y-2'>
//                             <Separator />
//                             <div className='flex items-center justify-between'>
//                               <Label className='text-sm font-medium'>Giao cho:</Label>
//                               <Select
//                                 value={selectedCharges[milestone.id] || ''}
//                                 onValueChange={(value) => handleChargeSelect(milestone.id, value)}
//                                 disabled={isLoadingUsers}
//                               >
//                                 <SelectTrigger className='w-64'>
//                                   <SelectValue
//                                     placeholder={
//                                       isLoadingUsers
//                                         ? 'Đang tải...'
//                                         : availableUsers.length === 0
//                                           ? 'Không có người thực hiện'
//                                           : 'Chọn người thực hiện...'
//                                     }
//                                   />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {isLoadingUsers ? (
//                                     <div className='p-4 text-center text-sm text-muted-foreground'>
//                                       Đang tải danh sách...
//                                     </div>
//                                   ) : availableUsers.length === 0 ? (
//                                     <div className='p-4 text-center text-sm text-muted-foreground'>
//                                       Không có người thực hiện
//                                     </div>
//                                   ) : (
//                                     availableUsers.map((user) => (
//                                       <SelectItem key={user.id} value={user.id}>
//                                         <div className='flex items-center space-x-2'>
//                                           <User className='h-4 w-4' />
//                                           <span>{user.fullName}</span>
//                                           <Badge variant='outline' className='text-xs'>
//                                             {user.roleName}
//                                           </Badge>
//                                         </div>
//                                       </SelectItem>
//                                     ))
//                                   )}
//                                 </SelectContent>
//                               </Select>
//                             </div>

//                             {selectedCharges[milestone.id] && (
//                               <div className='bg-green-50 border border-green-200 rounded p-2'>
//                                 <div className='flex items-center space-x-2 text-sm text-green-800'>
//                                   <CheckCircle className='h-4 w-4' />
//                                   <span>
//                                     Sẽ giao cho: <strong>{getUserById(selectedCharges[milestone.id])?.fullName}</strong>{' '}
//                                     ({getUserById(selectedCharges[milestone.id])?.roleName})
//                                   </span>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )
//                       })()}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>

//           {/* Assignment Summary */}
//           {selectedCount > 0 && (
//             <Card className='bg-blue-50 border-blue-200'>
//               <CardContent className='p-4'>
//                 <div className='flex items-start space-x-3'>
//                   <Users className='h-5 w-5 text-blue-600 mt-0.5' />
//                   <div className='space-y-2'>
//                     <h4 className='font-medium text-blue-900'>Tóm tắt giao việc</h4>
//                     <div className='text-sm text-blue-800 space-y-1'>
//                       <p>• Sẽ giao {selectedCount} milestone</p>
//                       <p>• Các milestone sẽ được giao cho người thực hiện tương ứng</p>
//                       <div className='space-y-1 mt-2'>
//                         {Object.entries(selectedCharges).map(([milestoneId, chargeId]) => {
//                           const milestone = milestones.find((m) => m.id === milestoneId)
//                           const user = getUserById(chargeId)
//                           return (
//                             <div key={milestoneId} className='text-xs bg-blue-100 rounded p-1'>
//                               "{milestone?.name}" → {user?.fullName} ({user?.roleName})
//                             </div>
//                           )
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         <DialogFooter className='flex space-x-2'>
//           <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
//             Hủy
//           </Button>
//           <Button onClick={handleSubmit} disabled={isSubmitting || selectedCount === 0} className='min-w-[120px]'>
//             {isSubmitting ? 'Đang giao việc...' : `Giao ${selectedCount} milestone`}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
