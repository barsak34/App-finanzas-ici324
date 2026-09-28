# Backend - App de Finanzas del Hogar

Backend desarrollado con Next.js (App Router), TypeScript y PostgreSQL (Supabase) utilizando sentencias SQL preparadas con el driver `pg`.

---

## Estructura del Proyecto

```text
├── app/
│   ├── api/
│   │   ├── miembros/
│   │   │   ├── route.ts              # GET (Listar / Consulta 9), POST (Consulta 2)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET, PUT (Consulta 4), DELETE logica (Consulta 8)
│   │   ├── categorias/
│   │   │   ├── route.ts              # GET, POST (Consulta 1)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET, DELETE fisica (Consulta 7)
│   │   ├── transacciones/
│   │   │   ├── route.ts              # GET, POST (Consulta 3)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET, PATCH monto (Consulta 5), DELETE (Consulta 6)
│   │   ├── reportes/
│   │   │   ├── egresos/
│   │   │   │   └── route.ts          # GET Consulta 10 (1 JOIN: Egresos con Miembro)
│   │   │   └── mayores-a/
│   │   │       └── route.ts          # GET Consulta 11 (2 JOINs: Miembro + Categoria > Monto)
│   │   └── docs/
│   │       └── route.ts              # GET Especificacion OpenAPI 3.0 en JSON
│   ├── api-docs/
│   │   └── page.tsx                  # Documentacion interactiva Swagger UI
│   ├── layout.tsx
│   └── page.tsx                      # Redireccion automatica a /api-docs
├── base_datos/
│   └── schema.sql                    # Script DDL para Supabase SQL Editor
├── lib/
│   ├── db.ts                         # Pool de conexion PostgreSQL (driver pg)
│   ├── seguridad.ts                  # Hash bcrypt, ofuscacion y validaciones OWASP
│   └── swagger-spec.ts               # Definicion OpenAPI de la API
├── servicios/
│   ├── miembros.ts                   # Consultas SQL para tabla MIEMBRO
│   ├── categorias.ts                 # Consultas SQL para tabla CATEGORIA
│   └── transacciones.ts              # Consultas SQL para tabla TRANSACCION
├── tipos/
│   └── index.ts                      # Tipos e interfaces de TypeScript
├── scripts/
│   └── Prueba-BD.js                  # Script de verificacion de consultas SQL
├── .env.example                      # Ejemplo de configuracion
├── package.json
└── tsconfig.json
```

---

## Configuracion y Ejecucion

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos en Supabase
1. Crear el proyecto en Supabase.
2. Abrir el SQL Editor en el panel de Supabase.
3. Ejecutar el script contenido en `base_datos/schema.sql`.

### 3. Configurar variables de entorno
Crear un archivo `.env.local` en la raiz del proyecto con la URI de conexion a PostgreSQL:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```
*Nota: La URI se obtiene en Supabase: Project Settings -> Database -> Connection string (URI).*

### 4. Probar conexion y consultas
Ejecutar la suite de pruebas directas en consola:
```bash
npm run test:db
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```
- Swagger UI: `http://localhost:3000` o `http://localhost:3000/api-docs`
- Especificacion OpenAPI: `http://localhost:3000/api/docs`

---

## Consultas SQL y Endpoints

| Consulta | Operacion | Descripcion | Endpoint |
|---|---|---|---|
| Consulta 1 | INSERT | Insertar Categoria | `POST /api/categorias` |
| Consulta 2 | INSERT | Insertar Miembro | `POST /api/miembros` |
| Consulta 3 | INSERT | Insertar Transaccion | `POST /api/transacciones` |
| Consulta 4 | UPDATE | Actualizar datos/telefono de Miembro | `PUT /api/miembros/[id]` |
| Consulta 5 | UPDATE | Modificar monto de Transaccion | `PATCH /api/transacciones/[id]` |
| Consulta 6 | DELETE | Eliminar Transaccion por ID | `DELETE /api/transacciones/[id]` |
| Consulta 7 | DELETE | Eliminar Categoria por ID | `DELETE /api/categorias/[id]` |
| Consulta 8 | UPDATE | Baja logica de Miembro (`estado_activo = false`) | `DELETE /api/miembros/[id]` |
| Consulta 9 | SELECT | Seleccionar miembros activos | `GET /api/miembros?solo_activos=true` |
| Consulta 10 | SELECT (1 JOIN) | Egresos con nombre de miembro | `GET /api/reportes/egresos` |
| Consulta 11 | SELECT (2 JOINs) | Transacciones con miembro y categoria mayores a monto | `GET /api/reportes/mayores-a?monto=30000` |
