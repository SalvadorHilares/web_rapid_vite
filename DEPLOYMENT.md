# 🚀 Guía de Despliegue - Maki Orders

## 📋 Configuración de Producción

### 🔧 Variables de Entorno

Para el despliegue en producción, asegúrate de que las siguientes variables estén configuradas:

```bash
# URL base de la API Gateway
VITE_API_BASE_URL=https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod
```

### 🌐 Configuración de Amplify

1. **Variables de Entorno en Amplify:**
   - Ve a tu aplicación en AWS Amplify Console
   - Ve a "App settings" → "Environment variables"
   - Agrega: `VITE_API_BASE_URL` = `https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod`

2. **Build Settings:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### 🔍 Verificación de APIs

#### ✅ URLs que deben funcionar:
- **Orders API**: `https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/orders/orders/`
- **Menu API**: `https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/menu/api/makis`
- **Inventory API**: `https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/inventory/ingredientes`

#### 🧪 Comandos de Prueba:
```bash
# Probar Orders API
curl https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/orders/orders/

# Probar Menu API
curl https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/menu/api/makis

# Probar Inventory API
curl https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/inventory/ingredientes
```

### 🐛 Solución de Problemas

#### Error 404 en Producción:
1. **Verificar que la API Gateway esté desplegada**
2. **Verificar que los microservicios estén corriendo**
3. **Verificar las variables de entorno en Amplify**

#### Error CORS:
1. **Verificar configuración CORS en API Gateway**
2. **Verificar headers en las respuestas de los microservicios**

### 📱 Configuración Local vs Producción

| Entorno | BASE_URL | Proxy |
|---------|----------|-------|
| **Desarrollo** | `''` (vacío) | ✅ Vite proxy |
| **Producción** | `https://jiql4i2xy4...` | ❌ Sin proxy |

### 🔄 Flujo de Despliegue

1. **Commit cambios** al repositorio
2. **Amplify detecta cambios** automáticamente
3. **Build con variables de entorno** correctas
4. **Deploy a S3/CloudFront**
5. **Verificar APIs** funcionando

### 📞 Contacto

Si tienes problemas con el despliegue, verifica:
- ✅ Variables de entorno configuradas
- ✅ APIs funcionando
- ✅ CORS configurado
- ✅ Build exitoso
