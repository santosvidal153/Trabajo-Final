CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,             
    email VARCHAR(255) UNIQUE NOT NULL,     
    password_hash VARCHAR(255) NOT NULL,     
    ocupacion VARCHAR(255),                   
    telefono VARCHAR(30),
    saldo DECIMAL(12,2) CHECK (saldo >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE objetivos (
    id SERIAL PRIMARY KEY, -- PK
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, -- FK
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