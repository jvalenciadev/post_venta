export type Role = 'admin' | 'cajero' | 'cocinero' | 'mesero' | 'reportes' | 'gastos'

export type OrderStatus = 'pendiente' | 'preparando' | 'completado' | 'cancelado'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: Role
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  order_number: number
  status: OrderStatus
  total: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  profile?: Profile
  payment?: Payment
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  product?: Product
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  method: 'cash' | 'card' | 'transfer'
  change_given: number
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface DailySalesReport {
  date: string
  total_orders: number
  total_revenue: number
  avg_order_value: number
}

export interface ProductSalesReport {
  product_id: string
  product_name: string
  total_quantity: number
  total_revenue: number
}

export interface Expense {
  id: string
  concept: string
  amount: number
  person_name: string
  date: string
  created_at: string
  updated_at: string
}
