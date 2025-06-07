export interface Category {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Style {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CategoryFormData {
  name: string
}

export interface StyleFormData {
  name: string
}
