import express from "express";
import cors from "cors";
import socket from "socket.io";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Guest from "./guest";
import { checkPassword } from "./middleware";
import morgan from "morgan";
const PORT = process.env.PORT || 3080;
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

dotenv.config();
const server = http.createServer(app);
const io = new socket.Server(server, { cors: { origin: "*" } });
const uri: string = `mongodb+srv://tim:${process.env.MONGO_PASSWORD}@cluster0.k1aaw.mongodb.net/guestmanager?retryWrites=true&w=majority`;
app.use(checkPassword);
app.get("/guest", async (req, res) => {
  const guests = await Guest.find({}).lean();
  return res.status(200).json(guests);
});

app.get("/login", (req, res) => {
  res.sendStatus(200);
});
app.post("/guest", async (req, res) => {
  const body = req.body;
  try {
    const newGuest = new Guest({
      createdAt: new Date(),
      name: body.name,
      createdBy: <string>req.headers.auth,
      notes: body.notes,
      sleepover: body.sleepover,
      driving: body.driving,
      left: false,
      guy: body.guy,
    });
    const formatted = await newGuest.save();
    io.emit("new-guest", formatted.toJSON());
    return res.status(200).json(formatted.toJSON());
  } catch (error) {
    res.status(500).json({ error, message: "failed to create guest" });
  }
});
// app.put("/guest/:id", async (req, res) => {
//   const body = req.body;
//   try {
//     const guest = await Guest.findOne({ _id: req.params.id });
//     if (guest) {
//       guest.name = body.name;
//       guest.createdBy = <string>req.headers.auth;
//       guest.notes = body.notes;
//       guest.sleepover = body.sleepover;
//       guest.driving = body.driving;
//       guest.left = body.left;
//       guest.guy = body.guy;
//       const formatted = await guest.save();
//       io.emit("update-guest", formatted.toJSON());
//       return res.status(200).json(formatted.toJSON());
//     } else res.sendStatus(404);
//   } catch (error) {
//     res.status(500).json({ error, message: "failed to update guest" });
//   }
// });
app.patch("/guest/:id", async (req, res) => {
  try {
    const guest = await Guest.findOne({ _id: req.params.id });
    console.log(req.params.id);

    console.log(guest);

    if (guest) {
      guest.left = true;
      const formatted = await guest.save();
      io.emit("signout-guest", formatted.toJSON());
    } else res.sendStatus(404);
  } catch (error) {
    res.status(500).json({ error, message: "Failed to sign out guest" });
  }
});

app.delete("/guest/:id", async (req, res) => {
  const body = req.body;
  try {
    const guest = await Guest.findOneAndDelete({ _id: req.params.id });
    if (guest) {
      io.emit("delete-guest", req.params.id);
      return res.sendStatus(200);
    } else res.sendStatus(404);
  } catch (error) {
    res.status(500).json({ error, message: "failed to delete guest" });
  }
});
io.on("connection", () => {
  console.log("connected");
});
mongoose
  .connect(uri)
  .then(() => {
    console.log("DB Connetion Successfull");
    server.listen(PORT, () => {
      console.log("listening on port", PORT);
    });
  })
  .catch((err) => {
    console.error(err);
    console.log("connected to db");
  });

mongoose.set("runValidators", true);
