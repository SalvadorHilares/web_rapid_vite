// Configuración de variables de entorno
export const ENV_CONFIG = {
  // URL base de la API Gateway
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod',
  
  // Entorno actual
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Debug
  DEBUG: import.meta.env.VITE_DEBUG === 'true'
}

// Función para debug
export const debugLog = (message: string, data?: any) => {
  if (ENV_CONFIG.DEBUG || ENV_CONFIG.IS_DEVELOPMENT) {
    console.log(`[DEBUG] ${message}`, data)
  }
}
