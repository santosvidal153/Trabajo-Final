import express from "express";
import dotenv from "dotenv";

//agregar routes desde acá
import transacciones from "./routes/transacciones-back.js"

dotenv.config();
const app = express();
app.use(express.json());

app.get("/",(req, res) => {
    res.send("backend ok");
});

//agregar endpoints desde acá
app.use("/transacciones", transacciones);

app.listen(process.env.PORT, () => {
  console.log("backend ok, puerto:", process.env.PORT);
});
