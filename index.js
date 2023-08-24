const express = require("express");
const multer = require("multer");
require("dotenv").config();
const ffmpeg = require("fluent-ffmpeg");
const AWS = require("aws-sdk");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

AWS.config.update({
  accessKeyId: process.env.aws_access_key,
  secretAccessKey: process.env.aws_secret_key,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/upload", require("./routes/upload"));
app.use("/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
