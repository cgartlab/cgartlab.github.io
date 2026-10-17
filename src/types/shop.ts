/** Product from the payment API */
export interface Product {
  id: number
  name: string
  description?: string
  price: number // cents (CNY)
  category?: string
  cover_image?: string
  images?: string[]
  file_size?: string
  file_format?: string
  version?: string
  updated_at?: string
  status?: 'active' | 'inactive'
}

/** Order from the payment API */
export interface Order {
  order_no: string
  product_id: number
  product_name?: string
  amount: number // cents
  amount_display?: string
  email?: string
  status: 'pending' | 'paid' | 'expired' | 'refunded'
  qr_alipay_url?: string
  qr_wechat_url?: string
  expires_at?: string
  download_token?: string
  created_at?: string
}

/** Create order request body */
export interface CreateOrderBody {
  product_id: number
  email: string
}
