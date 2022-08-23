"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const guest_1 = __importDefault(require("./guest"));
const middleware_1 = require("./middleware");
const morgan_1 = __importDefault(require("morgan"));
const PORT = process.env.PORT || 3080;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny"));
dotenv_1.default.config();
const server = http_1.default.createServer(app);
const io = new socket_io_1.default.Server(server, { cors: { origin: "*" } });
const uri = `mongodb+srv://tim:${process.env.MONGO_PASSWORD}@cluster0.k1aaw.mongodb.net/guestmanager?retryWrites=true&w=majority`;
app.use(middleware_1.checkPassword);
app.get("/guest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guests = yield guest_1.default.find({}).lean();
    return res.status(200).json(guests);
}));
app.get("/login", (req, res) => {
    res.sendStatus(200);
});
app.post("/guest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const newGuest = new guest_1.default({
            createdAt: new Date(),
            name: body.name,
            createdBy: req.headers.auth,
            notes: body.notes,
            sleepover: body.sleepover,
            driving: body.driving,
            left: false,
            guy: body.guy,
        });
        const formatted = yield newGuest.save();
        io.emit("new-guest", formatted.toJSON());
        return res.status(200).json(formatted.toJSON());
    }
    catch (error) {
        res.status(500).json({ error, message: "failed to create guest" });
    }
}));
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
app.patch("/guest/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guest = yield guest_1.default.findOne({ _id: req.params.id });
        console.log(req.params.id);
        console.log(guest);
        if (guest) {
            guest.left = true;
            const formatted = yield guest.save();
            io.emit("signout-guest", formatted.toJSON());
        }
        else
            res.sendStatus(404);
    }
    catch (error) {
        res.status(500).json({ error, message: "Failed to sign out guest" });
    }
}));
app.delete("/guest/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const guest = yield guest_1.default.findOneAndDelete({ _id: req.params.id });
        if (guest) {
            io.emit("delete-guest", req.params.id);
            return res.sendStatus(200);
        }
        else
            res.sendStatus(404);
    }
    catch (error) {
        res.status(500).json({ error, message: "failed to delete guest" });
    }
}));
io.on("connection", () => {
    console.log("connected");
});
mongoose_1.default
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
mongoose_1.default.set("runValidators", true);
