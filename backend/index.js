import express from "express";
import dotenv from "dotenv";
import cors from "cors";


//agregar import desde aca
import inicio from "./routes/inicio-back.js"
import transacciones from "./routes/transacciones-back.js"
import objetivosRouter from "./routes/objetivos-back.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


app.get("/",(req, res) => {
    res.send("backend ok");
});


//agregar rutas desde aca
app.use("/inicio", inicio);
app.use("/transacciones", transacciones);
app.use('/api/objetivos', objetivosRouter);

app.listen(process.env.PORT, () => {
  console.log("backend ok, puerto:", process.env.PORT);
});
