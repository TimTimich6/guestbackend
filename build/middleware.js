"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPassword = void 0;
const adminpasswords = ["nicoadmin", "mayaadmin", "timhost", "kadenadmin", "harryadmin", "unknownadmin"];
function checkPassword(req, res, next) {
    console.log(req.headers.auth);
    if (adminpasswords.includes(req.headers.auth))
        return next();
    else
        return res.sendStatus(403);
}
exports.checkPassword = checkPassword;
