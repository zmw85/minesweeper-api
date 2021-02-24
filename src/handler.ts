import express, { Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import serverless from "serverless-http";
import { APIGatewayEvent, Context } from "aws-lambda";

import { expressLogger, consoleLogger as logger } from "./utils/logger";
import { contactMeRouter, statusRouter } from "./routers";

const app = express();

app.use(expressLogger);
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/contactme", contactMeRouter);
app.use("/status", statusRouter);

const handler = serverless(app);

export const expressHandler = async (
  event: APIGatewayEvent,
  context: Context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    return await handler(event, context);
  } catch (err) {
    logger.error(err);
  }
};
