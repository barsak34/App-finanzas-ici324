-- =======================================================================
-- PROYECTO UNIVERSITARIO: App de Finanzas del Hogar
-- MOTOR: PostgreSQL (Supabase SQL Editor Compatible)
-- DESCRIPCIÓN: Script DDL para creación de tablas, llaves e integridad referencial
-- =======================================================================

-- 1. Limpieza de tablas previas (opcional si se reinicia la BD)
DROP TABLE IF EXISTS TRANSACCION CASCADE;
DROP TABLE IF EXISTS CATEGORIA CASCADE;
DROP TABLE IF EXISTS MIEMBRO CASCADE;

-- 2. Creación de Tabla MIEMBRO
CREATE TABLE MIEMBRO (
    id_miembro SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    contrasena VARCHAR(255),
    estado_activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Creación de Tabla CATEGORIA
CREATE TABLE CATEGORIA (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 4. Creación de Tabla TRANSACCION (Relación 1:N con MIEMBRO y CATEGORIA)
CREATE TABLE TRANSACCION (
    id_transaccion SERIAL PRIMARY KEY,
    id_miembro INT NOT NULL,
    id_categoria INT NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('Ingreso', 'Egreso')),
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    medio_pago VARCHAR(50) NOT NULL,
    descripcion_gasto TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Integridad Referencial (Llaves Foráneas)
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

-- 5. Creación de Índices para optimizar las consultas con JOIN y filtros frecuentes
CREATE INDEX idx_transaccion_miembro ON TRANSACCION(id_miembro);
CREATE INDEX idx_transaccion_categoria ON TRANSACCION(id_categoria);
CREATE INDEX idx_transaccion_tipo ON TRANSACCION(tipo_movimiento);
CREATE INDEX idx_miembro_activo ON MIEMBRO(estado_activo);

-- =======================================================================
-- DATOS SEMILLA (SEED DATA) PARA PRUEBAS INICIALES
-- =======================================================================

-- Miembros de prueba
INSERT INTO MIEMBRO (nombre_completo, correo, telefono, contrasena, estado_activo) VALUES
('Juan Pérez', 'juan.perez@example.com', '+56911112222', '$2a$10$w8c5sU5Jq0iK3hX9xYz.E.Zq7T8X8hW9K4vL3M2N1O0P1Q2R3S4T', TRUE),
('María González', 'maria.gonzalez@example.com', '+56933334444', '$2a$10$w8c5sU5Jq0iK3hX9xYz.E.Zq7T8X8hW9K4vL3M2N1O0P1Q2R3S4T', TRUE),
('Carlos Tapia', 'carlos.tapia@example.com', '+56955556666', '$2a$10$w8c5sU5Jq0iK3hX9xYz.E.Zq7T8X8hW9K4vL3M2N1O0P1Q2R3S4T', FALSE);

-- Categorías de prueba
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES
('Alimentación', 'Compras de supermercado y alimentos'),
('Servicios Básicos', 'Luz, agua, gas e internet'),
('Salud', 'Farmacias y consultas médicas'),
('Sueldo / Salario', 'Ingresos mensuales de trabajo');

-- Transacciones de prueba
INSERT INTO TRANSACCION (id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro) VALUES
(1, 4, 'Ingreso', 850000.00, 'Transferencia Bancaria', 'Sueldo mensual Juan', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 1, 'Egreso', 45000.50, 'Tarjeta de Débito', 'Supermercado semanal', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 2, 'Egreso', 32000.00, 'Transferencia Bancaria', 'Pago cuenta de agua y luz', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 1, 'Egreso', 15000.00, 'Efectivo', 'Compra de panadería y verduras', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 3, 'Egreso', 28500.00, 'Tarjeta de Crédito', 'Medicamentos recetados', CURRENT_TIMESTAMP);
