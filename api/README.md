# AquaWash — Backend

API REST para el sistema de gestión de lavaderos de autos.

## Stack
- Node.js + Express
- Sequelize ORM
- PostgreSQL
- JWT para autenticación

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL y un JWT_SECRET seguro
```

### 3. Crear la base de datos en PostgreSQL
```sql
CREATE DATABASE aquawash;
```

### 4. Sincronizar tablas
```bash
npm run db:sync
```

### 5. Iniciar el servidor
```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

---

## Endpoints

### Auth
| Método | Ruta            | Descripción                        |
|--------|-----------------|------------------------------------|
| POST   | /auth/register  | Registrar nuevo lavadero           |
| POST   | /auth/login     | Iniciar sesión                     |
| GET    | /auth/me        | Datos del lavadero autenticado     |

### Clientes
| Método | Ruta            | Descripción                        |
|--------|-----------------|------------------------------------|
| GET    | /clientes       | Listar (acepta ?search=)           |
| GET    | /clientes/:id   | Detalle con autos e historial      |
| POST   | /clientes       | Crear cliente                      |
| PUT    | /clientes/:id   | Actualizar cliente                 |
| DELETE | /clientes/:id   | Eliminar cliente                   |

### Autos
| Método | Ruta        | Descripción                            |
|--------|-------------|----------------------------------------|
| GET    | /autos      | Listar (acepta ?cliente_id=)           |
| GET    | /autos/:id  | Detalle                                |
| POST   | /autos      | Crear auto                             |
| PUT    | /autos/:id  | Actualizar auto                        |
| DELETE | /autos/:id  | Eliminar auto                          |

### Servicios
| Método | Ruta             | Descripción                          |
|--------|------------------|--------------------------------------|
| GET    | /servicios       | Listar los 3 servicios del lavadero  |
| PUT    | /servicios/:id   | Actualizar precio, nombre, duración  |

### Turnos
| Método | Ruta          | Descripción                                        |
|--------|---------------|----------------------------------------------------|
| GET    | /turnos       | Listar (acepta ?fecha=, ?estado=, ?desde=, ?hasta=)|
| GET    | /turnos/:id   | Detalle                                            |
| POST   | /turnos       | Crear turno                                        |
| PUT    | /turnos/:id   | Actualizar turno                                   |
| DELETE | /turnos/:id   | Cancelar turno                                     |

### Órdenes de lavado
| Método | Ruta                  | Descripción                               |
|--------|-----------------------|-------------------------------------------|
| GET    | /ordenes              | Listar (acepta ?estado=, ?fecha=)         |
| GET    | /ordenes/:id          | Detalle con cliente, auto y pago          |
| POST   | /ordenes              | Crear orden (cliente llega al lavadero)   |
| PUT    | /ordenes/:id          | Actualizar notas                          |
| POST   | /ordenes/:id/avanzar  | Avanzar estado (máquina de estados)       |

#### Flujo de estados
```
esperando → lavando → listo → entregado
```
Al pasar a `entregado` se crea automáticamente el registro en `pagos`.

### Dashboard
| Método | Ruta        | Descripción                              |
|--------|-------------|------------------------------------------|
| GET    | /dashboard  | Métricas del día (ingresos, autos, etc.) |

---

## Multi-tenancy

Todos los endpoints filtran automáticamente por `lavadero_id` extraído del JWT.
Un lavadero nunca puede ver ni modificar datos de otro lavadero.

## Seguridad
- Passwords hasheados con bcrypt (salt rounds: 12)
- JWT con expiración configurable (default: 7 días)
- Rate limiting en /auth (20 requests / 15 min)
- Validación de inputs en todos los endpoints
- `password_hash` nunca incluido en respuestas
