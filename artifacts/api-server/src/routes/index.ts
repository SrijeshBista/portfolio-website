import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import contactsRouter from "./contacts";
import profileRouter from "./profile";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(projectsRouter);
router.use(contactsRouter);
router.use(profileRouter);
router.use(statsRouter);

export default router;
