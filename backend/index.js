import express from "express";
import dotenv from "dotenv";
import cors from "cors";

//agregar import desde aca
import inicio from "./routes/inicio-back.js"
import transacciones from "./routes/transacciones-back.js"
import perfilRoutes from './routes/perfil-back.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());


app.get("/",(req, res) => {
    res.send("backend ok");
});


//agregar rutas desde aca
app.use('/api/perfil', perfilRoutes);
app.use("/inicio", inicio);
app.use("/transacciones", transacciones);


app.listen(process.env.PORT, () => {
  console.log("backend ok, puerto:", PORT);
});
