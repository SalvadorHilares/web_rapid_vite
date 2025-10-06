// Configuración de APIs para diferentes entornos
import { ENV_CONFIG, debugLog } from './env'

// URLs base de los microservicios
const API_BASE_URLS = {
  development: '', // Usar proxy de Vite
  production: ENV_CONFIG.API_BASE_URL
}

// Configuración actual
export const API_CONFIG = {
  baseUrl: ENV_CONFIG.IS_DEVELOPMENT ? API_BASE_URLS.development : API_BASE_URLS.production,
  isDevelopment: ENV_CONFIG.IS_DEVELOPMENT,
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
  // Si el endpoint ya es una URL completa, usarla directamente
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  
  // Si hay una base URL configurada, prependerla
  if (API_CONFIG.baseUrl) {
    // Asegurarse de que no haya doble barra
    const cleanedBaseUrl = API_CONFIG.baseUrl.endsWith('/') ? API_CONFIG.baseUrl.slice(0, -1) : API_CONFIG.baseUrl
    const cleanedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${cleanedBaseUrl}${cleanedEndpoint}`
  }
  
  // Si no hay base URL, usar el endpoint tal cual (desarrollo con proxy)
  return endpoint
}

// Función helper para logging
export const logApiCall = (method: string, url: string, data?: any) => {
  debugLog(`🌐 API ${method}: ${url}`, {
    isDevelopment: API_CONFIG.isDevelopment,
    baseUrl: API_CONFIG.baseUrl,
    envConfig: ENV_CONFIG,
    data: data || 'no data'
  })
}
