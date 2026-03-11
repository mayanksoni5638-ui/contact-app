require("dotenv").config();
const express = require("express");
const app = express();
const user = require("./routes/user");
const contact = require("./routes/contact");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then((res) => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(
  fileupload({
    useTempFile: true,
    tempFileDir: "/tmp/",
  }),
);
app.use("/addcon", contact);
// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use("/user", user);

module.exports = app;
