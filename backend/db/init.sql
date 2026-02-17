CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,             
    email VARCHAR(255) UNIQUE NOT NULL,     
    contrasena VARCHAR(255) NOT NULL,     
    pais VARCHAR(100),                   
    ciudad VARCHAR(100),
    saldo DECIMAL(12,2) CHECK (saldo >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE objetivos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    actual DECIMAL(12,2) DEFAULT 0 CHECK (actual >= 0),
    estado VARCHAR(50) DEFAULT 'progreso', 
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500),
    requeridos INTEGER DEFAULT 0 CHECK (requeridos >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT actual_no_excede_monto CHECK (actual <= monto)
);

CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    motivo VARCHAR(100) NOT NULL,
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso','gasto')),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('sueldo','ahorro','objetivo','alimento','transporte','salud','entretenimiento','otros')),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    objetivo_id INTEGER REFERENCES objetivos(id) ON DELETE SET NULL
);

