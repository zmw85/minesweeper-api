import express, { Request, Response } from "express";

import { AppConfig } from "../config";

const router = express.Router();

router.get("/ping", (req: Request, res: Response) => {
  const { serviceName, environment } = AppConfig;

  return res.json({
    message: `${serviceName} is healthy`,
    info: {
      service: AppConfig.serviceName,
      host: req.headers.host,
      environment,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
