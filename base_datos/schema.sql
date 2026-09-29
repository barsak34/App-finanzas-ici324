-- =======================================================================
-- PROYECTO UNIVERSITARIO: App de Finanzas del Hogar
-- MOTOR: PostgreSQL (Supabase SQL Editor Compatible)
-- DESCRIPCIÓN: Script DDL para creación de 4 tablas, llaves e integridad referencial
-- =======================================================================

-- 1. Limpieza de tablas previas (en orden por llaves foráneas)
DROP TABLE IF EXISTS TRANSACCION CASCADE;
DROP TABLE IF EXISTS CATEGORIA CASCADE;
DROP TABLE IF EXISTS MIEMBRO CASCADE;
DROP TABLE IF EXISTS HOGAR CASCADE;

-- 2. Creación de Tabla HOGAR
CREATE TABLE HOGAR (
    id_hogar SERIAL PRIMARY KEY,
    nombre_hogar VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Creación de Tabla MIEMBRO
CREATE TABLE MIEMBRO (
    id_miembro SERIAL PRIMARY KEY,
    id_hogar INT REFERENCES HOGAR(id_hogar) ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    contrasena VARCHAR(255),
    estado_activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Creación de Tabla CATEGORIA
CREATE TABLE CATEGORIA (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 5. Creación de Tabla TRANSACCION (Relación con MIEMBRO y CATEGORIA)
CREATE TABLE TRANSACCION (
    id_transaccion SERIAL PRIMARY KEY,
    id_miembro INT NOT NULL,
    id_categoria INT NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('Ingreso', 'Egreso')),
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    medio_pago VARCHAR(50) NOT NULL,
    descripcion_gasto TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_transaccion_miembro 
        FOREIGN KEY (id_miembro) 
        REFERENCES MIEMBRO (id_miembro) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,

    CONSTRAINT fk_transaccion_categoria 
        FOREIGN KEY (id_categoria) 
        REFERENCES CATEGORIA (id_categoria) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- 6. Creación de Índices para optimizar JOINs y filtros
CREATE INDEX idx_miembro_hogar ON MIEMBRO(id_hogar);
CREATE INDEX idx_transaccion_miembro ON TRANSACCION(id_miembro);
CREATE INDEX idx_transaccion_categoria ON TRANSACCION(id_categoria);
CREATE INDEX idx_transaccion_tipo ON TRANSACCION(tipo_movimiento);
CREATE INDEX idx_miembro_activo ON MIEMBRO(estado_activo);

-- =======================================================================
-- DATOS SEMILLA (SEED DATA)
-- =======================================================================

-- Hogares
INSERT INTO HOGAR (nombre_hogar) VALUES
('Departamento Mirador Valpo'),
('Casa Viña del Mar');

-- Miembros asociados a Hogares
INSERT INTO MIEMBRO (id_hogar, nombre_completo, correo, telefono, contrasena, estado_activo) VALUES
(1, 'Maximiliano Felipe Rozas Rifo', 'maximixasz@gmail.com', '+56912345678', '$2a$10$w8c5sU5Jq0iK3hX9xYz.E.Zq7T8X8hW9K4vL3M2N1O0P1Q2R3S4T', TRUE),
(1, 'Gladys Carvacho', 'gladys.carvacho@example.com', '+56987654321', '$2a$10$w8c5sU5Jq0iK3hX9xYz.E.Zq7T8X8hW9K4vL3M2N1O0P1Q2R3S4T', TRUE),
(2, 'Carlos Tapia', 'carlos.tapia@example.com', '+56955556666', '$2a$10$w8c5sU5Jq0iK3hX9xYz.E.Zq7T8X8hW9K4vL3M2N1O0P1Q2R3S4T', FALSE);

-- Categorías
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES
('Supermercado', 'Compras de despensa y articulos para el hogar'),
('Servicios Básicos', 'Luz, agua, gas e internet'),
('Salud', 'Farmacias y consultas médicas'),
('Sueldo / Salario', 'Ingresos mensuales de trabajo');

-- Transacciones
INSERT INTO TRANSACCION (id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro) VALUES
(1, 4, 'Ingreso', 850000.00, 'Transferencia Bancaria', 'Sueldo mensual', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 1, 'Egreso', 45000.00, 'Debito', 'Compra mensual supermercado', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 2, 'Egreso', 32000.00, 'Transferencia Bancaria', 'Pago de servicios', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 3, 'Egreso', 28500.00, 'Tarjeta de Crédito', 'Medicamentos recetados', CURRENT_TIMESTAMP);
