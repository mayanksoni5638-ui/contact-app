import dotenv from "dotenv";
dotenv.config();

import express from "express";
import user from "./routes/user.js";
import contact from "./routes/contact.js";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import fileupload from "express-fileupload";
import { rateLimit } from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

app.use("/addcon", contact);
app.use(limiter);
app.use("/user", user);

export default app;
