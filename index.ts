import express from "express";
import apiRoutes from "./src/routes/api";
import webRoutes from "./src/routes/web";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";
import { getDatabase } from "./src/config/database";
import multer from "multer";
import path from "path";

const app = express();


app.use('/public', express.static(path.join(__dirname, 'src/public')));

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();
app.use(upload.any());

getDatabase();

app.use("/", webRoutes);
app.use("/api", apiRoutes);

app.listen(process.env.APP_PORT || 5000, () => {
    console.log(`Server running at http://localhost:${process.env.APP_PORT || 5000}/`);
});
