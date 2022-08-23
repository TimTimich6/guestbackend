import { NextFunction, Request, Response } from "express";

const adminpasswords = ["nicoadmin", "mayaadmin", "timhost", "kadenadmin", "harryadmin", "unknownadmin"];
export function checkPassword(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers.auth);

  if (adminpasswords.includes(<string>req.headers.auth)) return next();
  else return res.sendStatus(403);
}
