import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

import tasksRouter from "@/routes/tasks";
import tagsRouter from "@/routes/tags";
import usersRouter from "@/routes/users";
import commentsRouter from "@/routes/comments";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient, User } from "@prisma/client";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { prisma } from "./config";

const app = express();

const port = process.env.PORT || 3000;
const sessionMiddleware = session({
  store: new PrismaSessionStore(new PrismaClient(), {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
  secret: process.env.SECRET as string,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 600 * 1000,
    httpOnly: false,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
passport.use(
  new LocalStrategy({ usernameField: "name" }, function (name, password, cb) {
    prisma.user
      .findUnique({ where: { name: name } })
      .then((user) => {
        if (!user) {
          return cb(null, false);
        }

        const isValid = password === user.password;

        if (isValid) {
          return cb(null, user);
        } else {
          return cb(null, false);
        }
      })
      .catch((err) => {
        cb(err);
      });
  }),
);

passport.serializeUser((user: any, cb) => {
  return cb(null, user.id);
});

passport.deserializeUser(async (id: number, cb) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
  });
  return cb(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/tasks", tasksRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/user", usersRouter);
app.use("/api/comments", commentsRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
