import express from "express";
import dotenv from "dotenv";
import cors from "cors";


//agregar import desde aca
import inicio from "./routes/inicio-back.js"
import transacciones from "./routes/transacciones-back.js"


dotenv.config();
const app = express();
app.use(express.json());

app.use(cors());
app.use(express.json());

app.get("/",(req, res) => {
    res.send("backend ok");
});


//agregar rutas desde aca
app.use("/inicio", inicio);
app.use("/transacciones", transacciones);

app.listen(process.env.PORT, () => {
  console.log("backend ok, puerto:", process.env.PORT);
});
