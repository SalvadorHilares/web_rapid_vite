// Configuración de APIs para diferentes entornos

const isDevelopment = import.meta.env.DEV

// URLs base de los microservicios
const API_BASE_URLS = {
  development: '', // Usar proxy de Vite
  production: 'https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod'
}

// Configuración actual
export const API_CONFIG = {
  baseUrl: isDevelopment ? API_BASE_URLS.development : API_BASE_URLS.production,
  isDevelopment,
  timeout: 10000, // 10 segundos
}

// Endpoints específicos
export const ENDPOINTS = {
  // Orders microservice (FastAPI + MySQL)
  orders: {
    base: '/api/orders',
    users: '/api/orders/users',
    orders: '/api/orders/orders',
    products: '/api/orders/products'
  },
  // Menu microservice (Spring Boot + PostgreSQL)
  menu: {
    base: '/api/menu',
    makis: '/api/menu/api/makis'
  },
  // Inventory microservice (NestJS + MongoDB)
  inventory: {
    base: '/api/inventory',
    ingredientes: '/api/inventory/ingredientes'
  }
}

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`
}

// Función helper para logging en desarrollo
export const logApiCall = (method: string, url: string, data?: any) => {
  if (API_CONFIG.isDevelopment) {
    console.log(`🌐 API ${method}: ${url}`, data ? { data } : '')
  }
}
