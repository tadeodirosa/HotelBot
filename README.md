# 🏨 HotelBot - Sistema de Gestión Hotelera con IA

Sistema integral de gestión hotelera con inteligencia artificial integrada para automatizar procesos de reservas, atención al cliente y gestión operativa.

## 🚀 Estado del Proyecto

**Versión Actual:** 1.0.0-alpha  
**Estado:** Fase 1 Completada - Backend Core Funcional  
**Próxima Fase:** Módulos de Negocio Avanzados  

### ✅ Completado (Fase 1)
- Backend NestJS con TypeScript
- Base de datos PostgreSQL con Prisma ORM
- Sistema de autenticación JWT
- Módulos Room Types y Rooms completamente funcionales
- API REST con documentación Swagger
- Validaciones exhaustivas y manejo de errores
- Pruebas completas del sistema

### 🚧 En Desarrollo (Fase 2)
- Módulo de gestión de clientes
- Sistema de reservas avanzado
- Planes de comida y servicios
- Testing automatizado completo

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** NestJS 10.x
- **Lenguaje:** TypeScript 5.x
- **Base de Datos:** PostgreSQL 17
- **ORM:** Prisma 5.x
- **Autenticación:** JWT con Passport
- **Validación:** class-validator + class-transformer
- **Documentación:** Swagger/OpenAPI

### Frontend (Planificado)
- **Framework:** React 18 con TypeScript
- **Styling:** Tailwind CSS
- **Estado:** Zustand o Redux Toolkit
- **UI Components:** Shadcn/ui

### IA Integration (Planificado)
- **Chatbot:** OpenAI GPT-4 o similar
- **Análisis:** Machine Learning para recomendaciones
- **Automatización:** Procesamiento de lenguaje natural

## 🏗️ Arquitectura

```
HotelBot/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Sistema de autenticación
│   │   ├── room-types/     # Gestión tipos de habitación
│   │   ├── rooms/          # Gestión de habitaciones
│   │   ├── customers/      # Gestión de clientes [EN DESARROLLO]
│   │   ├── reservations/   # Sistema de reservas [PLANIFICADO]
│   │   └── shared/         # Utilidades compartidas
│   └── prisma/             # Schema y migraciones
├── frontend/               # Aplicación React [PLANIFICADO]
├── shared/                 # Tipos y utilidades compartidas
└── docs/                   # Documentación del proyecto
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 17
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/HotelBot.git
cd HotelBot

# Instalar dependencias del backend
cd backend
npm install

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Ejecutar migraciones
npx prisma db push
npx prisma generate

# Iniciar servidor de desarrollo
npm run start:dev
```

### URLs Importantes
- **API:** http://localhost:3000
- **Documentación Swagger:** http://localhost:3000/api/docs
- **Base de datos:** postgresql://localhost:5432/hotelbot_dev

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Servidor con hot reload
npm run build              # Build de producción
npm run start:prod         # Servidor de producción

# Testing
npm run test               # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Coverage de tests

# Base de datos
npx prisma studio         # Interface visual de BD
npx prisma db push        # Sincronizar schema
npx prisma generate       # Generar cliente Prisma
```

## 🧪 Testing

El proyecto incluye testing exhaustivo:
- **Unit Tests:** Servicios y lógica de negocio
- **Integration Tests:** Endpoints de API
- **E2E Tests:** Flujos completos de usuario
- **Coverage:** >90% en servicios críticos

```bash
npm run test:cov
```

## 📚 Documentación

- **API Docs:** Disponible en `/api/docs` cuando el servidor está ejecutándose
- **Development Log:** Ver `development-log.md` para registro detallado
- **Roadmap:** Ver `roadmap.md` para planificación completa

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [Tu GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- NestJS team por el excelente framework
- Prisma team por el ORM intuitivo
- Comunidad de desarrollo por las mejores prácticas

---

**🏨 HotelBot - Revolucionando la gestión hotelera con inteligencia artificial**
