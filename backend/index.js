import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import perfilRoutes from './routes/perfil-back.js';

//agregar archivos desde acá


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get("/",(req, res) => {
    res.send("backend ok");
});

app.use('/api/perfil', perfilRoutes);

app.listen(process.env.PORT, () => {
  console.log("backend ok, puerto:", PORT);
});
