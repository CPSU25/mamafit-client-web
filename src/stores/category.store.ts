import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CategoryType } from '@/@types/inventory.type'

interface CategoryFilters {
  search: string
  sortBy: string
  pageSize: number
  currentPage: number
}

interface CategoryUIState {
  // Selected/Editing State
  selectedCategory: CategoryType | null
  
  // Expansion State
  expandedCategoryId: string | null
  
  // Filters
  filters: CategoryFilters
  
  // Form/Dialog State
  isFormDialogOpen: boolean
  isDeleteDialogOpen: boolean
  
  // Actions - UI State Only
  setSelectedCategory: (category: CategoryType | null) => void
  setExpandedCategoryId: (categoryId: string | null) => void
  updateFilters: (newFilters: Partial<CategoryFilters>) => void
  resetFilters: () => void
  setFormDialogOpen: (open: boolean) => void
  setDeleteDialogOpen: (open: boolean) => void
  
  // Toggle category expansion
  toggleCategoryExpansion: (categoryId: string) => void
}

const initialFilters: CategoryFilters = {
  search: '',
  sortBy: 'createdat_desc',
  pageSize: 10,
  currentPage: 1
}

export const useCategoryStore = create<CategoryUIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedCategory: null,
      expandedCategoryId: null,
      filters: initialFilters,
      isFormDialogOpen: false,
      isDeleteDialogOpen: false,

      // Set selected category for editing
      setSelectedCategory: (category: CategoryType | null) => {
        set({ selectedCategory: category })
      },

      // Set expanded category
      setExpandedCategoryId: (categoryId: string | null) => {
        set({ expandedCategoryId: categoryId })
      },

      // Update filters
      updateFilters: (newFilters: Partial<CategoryFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      // Reset filters
      resetFilters: () => {
        set({ filters: initialFilters })
      },

      // Set form dialog state
      setFormDialogOpen: (open: boolean) => {
        set({ isFormDialogOpen: open })
        if (!open) {
          // Clear selected category when closing dialog
          set({ selectedCategory: null })
        }
      },

      // Set delete dialog state
      setDeleteDialogOpen: (open: boolean) => {
        set({ isDeleteDialogOpen: open })
      },

      // Toggle category expansion
      toggleCategoryExpansion: (categoryId: string) => {
        const { expandedCategoryId } = get()
        
        if (expandedCategoryId === categoryId) {
          // Collapse if already expanded
          set({ expandedCategoryId: null })
        } else {
          // Expand
          set({ expandedCategoryId: categoryId })
        }
      },
    }),
    {
      name: 'category-ui-store',
    }
  )
) 