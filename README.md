# AI Knowledge Base - Chat con URLs

Una aplicación moderna que te permite guardar URLs, extraer su contenido automáticamente usando IA, y chatear con ese contenido para obtener respuestas inteligentes.

## 🚀 Características

- ✨ **Interfaz moderna y atractiva** con gradientes, animaciones y diseño dark mode
- 🔗 **Gestión de URLs** - Agrega URLs y la IA extrae y categoriza el contenido automáticamente
- 💬 **Chat con IA** - Pregunta sobre el contenido de tus URLs guardadas
- 🗂️ **Categorización automática** - La IA organiza tus URLs por categorías
- 🔍 **Búsqueda y filtros** - Encuentra rápidamente lo que necesitas
- 💾 **Persistencia en Firestore** - Tus datos se guardan de forma segura en la nube
- 📱 **Diseño responsive** - Funciona perfectamente en móviles y escritorio

## 🛠️ Tecnologías

- **React** + **Vite** - Framework moderno y rápido
- **Firebase Firestore** - Base de datos en tiempo real
- **Google Gemini AI** - IA gratuita para chat y extracción de contenido
- **Lucide React** - Iconos modernos

## 📋 Requisitos previos

1. **Node.js** (versión 16 o superior)
2. **Cuenta de Firebase** (gratuita)
3. **API Key de Gemini** (gratuita)

## ⚙️ Configuración

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (o usa uno existente)
3. En la configuración del proyecto, ve a "Configuración del proyecto"
4. En "Tus apps", crea una nueva app web
5. Copia la configuración de Firebase
6. Abre `src/firebase.js` y reemplaza los valores:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

7. En Firebase Console, ve a "Firestore Database" y crea una base de datos
8. Selecciona "Comenzar en modo de prueba" (puedes configurar reglas de seguridad después)

### 2. Configurar Gemini AI

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key (es **GRATIS** con límites generosos)
4. Copia la API key
5. Abre `src/services/gemini.js` y reemplaza:

```javascript
const API_KEY = 'tu-gemini-api-key-aqui';
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📖 Cómo usar

### Agregar URLs

1. Ve a la pestaña "Gestión de URLs"
2. Pega una URL en el campo de entrada
3. Haz clic en "Agregar URL"
4. La IA extraerá automáticamente el contenido y lo categorizará
5. La URL se guardará en Firestore

### Chatear con la IA

1. Ve a la pestaña "Chat con IA"
2. Escribe tu pregunta en el campo de entrada
3. La IA buscará en tus URLs guardadas y te dará una respuesta
4. Si encuentra información relevante, te dirá en qué URL está

### Buscar y filtrar

1. En la pestaña "Gestión de URLs", usa el campo de búsqueda
2. Filtra por categoría usando el selector
3. Elimina URLs que ya no necesites

## 🎨 Personalización

### Cambiar colores

Edita las variables CSS en `src/index.css`:

```css
:root {
  --primary-hue: 260; /* Cambia el tono principal */
  --primary-sat: 85%; /* Cambia la saturación */
  --primary-light: 60%; /* Cambia la luminosidad */
}
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Las API keys están en el código del cliente por simplicidad. Para producción:

1. Crea un backend que maneje las llamadas a Gemini
2. Configura reglas de seguridad en Firestore
3. Usa variables de entorno para las API keys

Ejemplo de reglas de Firestore básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /urls/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📦 Build para producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 🐛 Solución de problemas

### Error: "Firebase not configured"
- Verifica que hayas configurado correctamente `src/firebase.js`

### Error: "Gemini API key invalid"
- Verifica que tu API key sea correcta en `src/services/gemini.js`
- Asegúrate de que la API key esté activa en Google AI Studio

### Las URLs no se guardan
- Verifica que Firestore esté habilitado en Firebase Console
- Revisa las reglas de seguridad de Firestore

## 📄 Licencia

MIT

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de abrir issues o pull requests.

---

Hecho con ❤️ usando React, Firebase y Gemini AI
