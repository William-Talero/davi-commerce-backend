# eCommerce Backend - Clean Architecture

Backend NestJS con PosgreSQL implementado Clean Architecture, principios SOLID y patrones de diseño robustos para un Ecommerce simplificado como prueba técnica para Davivienda.

# Autor

William Andres Talero Cifuentes

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** dividida en capas claramente definidas:

```
src/
├── domain/                    # Capa de Dominio (Reglas de negocio)
│   ├── entities/             # Entidades de dominio
│   ├── repositories/         # Interfaces de repositorios
│   └── use-cases/           # Casos de uso
├── application/              # Capa de Aplicación (Servicios)
│   └── services/            # Implementaciones de servicios
├── infrastructure/           # Capa de Infraestructura (Framework & Drivers)
│   ├── database/            # Configuración de BD y entidades ORM
│   ├── repositories/        # Implementaciones de repositorios
│   └── config/             # Configuraciones
├── presentation/            # Capa de Presentación (Interface Adapters)
│   ├── controllers/         # Controladores HTTP
│   └── dtos/               # DTOs de entrada/salida
└── shared/                  # Código compartido
    ├── interfaces/          # Interfaces compartidas
    ├── constants/          # Constantes del sistema
    └── types/              # Tipos TypeScript
```

## 🎯 Principios SOLID Implementados

- **S** - Single Responsibility Principle: Cada clase tiene una única responsabilidad
- **O** - Open/Closed Principle: Abierto para extensión, cerrado para modificación
- **L** - Liskov Substitution Principle: Las implementaciones pueden sustituir interfaces
- **I** - Interface Segregation Principle: Interfaces específicas y pequeñas
- **D** - Dependency Inversion Principle: Dependencias hacia abstracciones, no hacia concreciones

## 🛠️ Tecnologías

- **NestJS** - Framework backend
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **class-validator** - Validación de DTOs
- **TypeScript** - Tipado estático

## 🚀 Configuración e Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar el archivo .env con tus configuraciones
```

### 3. Configurar base de datos PostgreSQL
```bash
# Crear la base de datos
createdb ecommerce
```

### 4. Ejecutar la aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📋 Variables de Entorno

```env
# Database Configuration
DATABASE_URL=************
DB_NAME=ecommerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Application Configuration
NODE_ENV=development
PORT=3001
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Usuarios (Próximamente)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos (Próximamente)
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Órdenes (Próximamente)
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders/:id` - Obtener orden
- `PUT /api/orders/:id/status` - Actualizar estado de orden

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run start:dev

# Construcción
npm run build

# Producción
npm run start:prod

# Tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting
npm run lint
```

## 📁 Estructura de Carpetas Detallada

### Domain Layer
- **Entities**: Modelos de dominio con lógica de negocio
- **Repositories**: Interfaces que definen contratos de persistencia
- **Use Cases**: Implementaciones de casos de uso específicos

### Application Layer
- **Services**: Servicios de aplicación que implementan interfaces compartidas

### Infrastructure Layer
- **Database**: Entidades ORM y configuración de TypeORM
- **Repositories**: Implementaciones concretas de los repositorios de dominio

### Presentation Layer
- **Controllers**: Puntos de entrada HTTP
- **DTOs**: Objetos de transferencia de datos con validación

## 🎨 Patrones de Diseño Implementados

1. **Repository Pattern**: Abstrae el acceso a datos
2. **Dependency Injection**: Gestión automática de dependencias con NestJS
3. **Factory Pattern**: Creación de objetos complejos
4. **Strategy Pattern**: Diferentes implementaciones de servicios
5. **Observer Pattern**: Para eventos del dominio (futuro)

## 🔒 Seguridad

- **JWT** para autenticación stateless
- **bcryptjs** para hash de contraseñas
- **Validación** automática de entrada con class-validator
- **CORS** configurado para frontend
- **Variables de entorno** para secretos

## 🧪 Testing

El proyecto está preparado para testing con Jest:

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📈 Próximas Funcionalidades

- [ ] Completar módulos de Productos y Órdenes
- [ ] Implementar autenticación con roles
- [ ] Agregar paginación y filtros
- [ ] Implementar cache con Redis
- [ ] Agregar logging estructurado
- [ ] Implementar rate limiting
- [ ] Documentación con Swagger
- [ ] Tests unitarios e integración
- [ ] CI/CD pipeline
- [ ] Monitoreo y métricas