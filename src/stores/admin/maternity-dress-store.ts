import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MaternityDressFilters } from '@/@types/admin.types'



interface MaternityDressUIState {
  // Selection State
  selectedMaternityDresses: string[]

  // Filters & Search
  filters: MaternityDressFilters
  searchTerm: string

  // Expandable Product State
  expandedMaternityDressId: string | null
  activeTab: 'info' | 'details'

  // Dialog States
  isCreateMaternityDressDialogOpen: boolean
  isCreateMaternityDressDetailDialogOpen: boolean
  isAddMaternityDressDetailDialogOpen: boolean
  isEditMaternityDressDialogOpen: boolean
  isDeleteMaternityDressDialogOpen: boolean

  // Actions - UI State Only
  // Selection
  selectMaternityDress: (id: string) => void
  selectAllMaternityDresses: (maternityDressIds: string[], select: boolean) => void
  clearSelection: () => void

  // Filters & Search
  setFilters: (filters: Partial<MaternityDressFilters>) => void
  setSearchTerm: (term: string) => void
  clearFilters: () => void

  // Expandable Product
  toggleMaternityDressExpansion: (maternityDressId: string) => void
  closeMaternityDressExpansion: () => void
  setActiveTab: (tab: 'info' | 'details') => void

  // Dialog Management
  setCreateMaternityDressDialogOpen: (open: boolean) => void
  setCreateMaternityDressDetailDialogOpen: (open: boolean) => void
  setAddMaternityDressDetailDialogOpen: (open: boolean) => void
  setEditMaternityDressDialogOpen: (open: boolean) => void
  setDeleteMaternityDressDialogOpen: (open: boolean) => void
}

export const useMaternityDressStore = create<MaternityDressUIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedMaternityDresses: [],
      filters: {},
      searchTerm: '',

      // Expandable Product State
      expandedMaternityDressId: null,
      activeTab: 'info',

      // Dialog States
      isCreateMaternityDressDialogOpen: false,
      isCreateMaternityDressDetailDialogOpen: false,
      isAddMaternityDressDetailDialogOpen: false,
      isEditMaternityDressDialogOpen: false,
      isDeleteMaternityDressDialogOpen: false,

      // Selection
      selectMaternityDress: (id) =>
        set((state) => {
          const selectedMaternityDresses = state.selectedMaternityDresses.includes(id)
            ? state.selectedMaternityDresses.filter((selectedId) => selectedId !== id)
            : [...state.selectedMaternityDresses, id]
          return { selectedMaternityDresses }
        }),

      selectAllMaternityDresses: (maternityDressIds, select) =>
        set(() => {
          const selectedMaternityDresses = select ? maternityDressIds : []
          return { selectedMaternityDresses }
        }),

      clearSelection: () => set({ selectedMaternityDresses: [] }),

      // Filters & Search
      setFilters: (newFilters) =>
        set((state) => {
          const filters = { ...state.filters, ...newFilters }
          return { filters }
        }),

      setSearchTerm: (term) => set({ searchTerm: term }),

      clearFilters: () => set({ filters: {}, searchTerm: '' }),

      // Expandable Product
      toggleMaternityDressExpansion: (maternityDressId) => {
        const { expandedMaternityDressId } = get()

        if (expandedMaternityDressId === maternityDressId) {
          // Collapse if already expanded
          set({
            expandedMaternityDressId: null,
            activeTab: 'info'
          })
        } else {
          // Expand new product
          set({
            expandedMaternityDressId: maternityDressId,
            activeTab: 'info'
          })
        }
      },

      closeMaternityDressExpansion: () =>
        set({
          expandedMaternityDressId: null,
          activeTab: 'info'
        }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      // Dialog Management
      setCreateMaternityDressDialogOpen: (open) => set({ isCreateMaternityDressDialogOpen: open }),

      setCreateMaternityDressDetailDialogOpen: (open) => set({ isCreateMaternityDressDetailDialogOpen: open }),

      setAddMaternityDressDetailDialogOpen: (open) => set({ isAddMaternityDressDetailDialogOpen: open }),

      setEditMaternityDressDialogOpen: (open) => set({ isEditMaternityDressDialogOpen: open }),

      setDeleteMaternityDressDialogOpen: (open) => {
        set({ isDeleteMaternityDressDialogOpen: open })
        if (!open) {
          // Clear selection when closing delete dialog
          set({ selectedMaternityDresses: [] })
        }
      }
    }),
    {
      name: 'maternity-dress-ui-store'
    }
  )
)
