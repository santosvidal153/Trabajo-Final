# Trabajo-Final
## UpFinance
UpFinance es una aplicacion web de finanzas personales en la que el usuario puede ver y controlar sus ingresos y egresos, asi como tambien crear objetivos de ahorro y llevar un manejo de estos.

Este proyecto fue creado utilizando Bulma, FontAwesome, HTML, CSS y JavaScript para el frontend. Y para el backend se uso Node.js y Express, con PostgreSQL como base de datos.

## Ejecución del proyecto 

Nota: antes es necesario tener instalado `Node.js`, `Docker`, `Docker Compose` y `Git`.

### 1. Clonar repositorio
```
git clone https://github.com/santosvidal153/Trabajo-Final.git
cd Trabajo-Final
```

### 2. Ejecutar backend

#### Opcion 1: Correr Makefile
```
cd backend
make setup
```

#### Opcion 2: Correr comandos separados
```
cd backend
npm install
docker compose up -d
npm run dev 
```

### 3. Abrir pagina web

[Pagina web.](https://upfinance-glnc.onrender.com)

### Acceso a PostgreSQL desde Docker

Para abrir terminal de postgre: `docker exec -it upfinance-db psql -U user-uf -d upfinance`

#### Integrantes
 Valentina Martel - Santos Vidal Albarracin - Estrella Pallarta Marin
