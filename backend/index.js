import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

//agregar archivos desde acá


dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/",(req, res) => {
    res.send("backend ok");
});

app.listen(process.env.PORT, () => {
  console.log("backend ok, puerto:", process.env.PORT);
});
