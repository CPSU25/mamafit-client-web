import { useState, useMemo, useEffect } from 'react'
import { DressTemplate, TemplateStats, ViewMode, SortBy, FilterBy } from '@/@types/designer.types'

interface UseTemplateManagerParams {
  initialTemplates: DressTemplate[]
  initialSearchTerm?: string
  initialViewMode?: ViewMode
  initialSortBy?: SortBy
  initialFilterBy?: FilterBy
}

interface UseTemplateManagerReturn {
  templates: DressTemplate[]
  stats: TemplateStats
  filteredTemplates: DressTemplate[]
  groupedByStyle: Record<string, { styleName: string; templates: DressTemplate[] }>
  searchTerm: string
  setSearchTerm: (term: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  sortBy: SortBy
  setSortBy: (sort: SortBy) => void
  filterBy: FilterBy
  setFilterBy: (filter: FilterBy) => void
}

export const useTemplateManager = (params: UseTemplateManagerParams): UseTemplateManagerReturn => {
  const {
    initialTemplates,
    initialSearchTerm = '',
    initialViewMode = 'grid',
    initialSortBy = 'CREATED_AT_DESC',
    initialFilterBy = 'all'
  } = params

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy)
  const [filterBy, setFilterBy] = useState<FilterBy>(initialFilterBy)

  // Update state when initial values change
  useEffect(() => {
    setSearchTerm(initialSearchTerm)
  }, [initialSearchTerm])

  useEffect(() => {
    setViewMode(initialViewMode)
  }, [initialViewMode])

  useEffect(() => {
    setSortBy(initialSortBy)
  }, [initialSortBy])

  useEffect(() => {
    setFilterBy(initialFilterBy)
  }, [initialFilterBy])

  // Calculate stats
  const stats = useMemo((): TemplateStats => {
    const styles = new Set(initialTemplates.map((t) => t.styleId)).size
    const templates = initialTemplates.length
    const componentOptions = initialTemplates.reduce(
      (acc, template) => acc + (template.componentOptions?.length || 0),
      0
    )
    const totalPrice = initialTemplates.reduce(
      (acc, template) =>
        acc + template.price + (template.componentOptions?.reduce((optAcc, opt) => optAcc + opt.price, 0) || 0),
      0
    )

    return {
      styles,
      templates,
      componentOptions,
      totalPrice
    }
  }, [initialTemplates])

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...initialTemplates]

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (template) =>
          template.id.toLowerCase().includes(lowerSearchTerm) ||
          template.styleName.toLowerCase().includes(lowerSearchTerm) ||
          template.createdBy.toLowerCase().includes(lowerSearchTerm) ||
          template.componentOptions?.some(
            (option) =>
              option.name.toLowerCase().includes(lowerSearchTerm) ||
              option.componentName.toLowerCase().includes(lowerSearchTerm)
          )
      )
    }

    // Apply category filter
    switch (filterBy) {
      case 'SYSTEM':
        filtered = filtered.filter((t) => t.type === 'SYSTEM')
        break
      case 'USER':
        filtered = filtered.filter((t) => t.type === 'USER')
        break
      case 'default':
        filtered = filtered.filter((t) => t.isDefault)
        break
      case 'hasOptions':
        filtered = filtered.filter((t) => t.componentOptions && t.componentOptions.length > 0)
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'CREATED_AT_DESC':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'UPDATED_AT_DESC':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'PRICE_DESC':
          return b.price - a.price
        case 'STYLE_NAME_DESC':
          return a.styleName.localeCompare(b.styleName)
        default:
          return 0
      }
    })

    return filtered
  }, [initialTemplates, searchTerm, filterBy, sortBy])

  // Group templates by styleId
  const groupedByStyle = useMemo(() => {
    const groups: Record<string, { styleName: string; templates: DressTemplate[] }> = {}

    filteredTemplates.forEach((template) => {
      if (!groups[template.styleId]) {
        groups[template.styleId] = {
          styleName: template.styleName,
          templates: []
        }
      }
      groups[template.styleId].templates.push(template)
    })

    return groups
  }, [filteredTemplates])

  return {
    templates: initialTemplates,
    stats,
    filteredTemplates,
    groupedByStyle,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy
  }
}
