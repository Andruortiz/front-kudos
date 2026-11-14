import { apiFetch } from './client'
import type { Category, ListCategoriesResponse } from './types'

export async function listCategories(): Promise<Category[]> {
  const response = await apiFetch<ListCategoriesResponse>('/api/v1/categories')
  return response.items
}
