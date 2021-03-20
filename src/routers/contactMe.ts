import express, { Request, Response } from "express";
import { body } from "express-validator";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { expressValidater } from "../utils/express-validator";
import { consoleLogger as logger } from "../utils/logger";
import { AppConfig } from "../config";

const router = express.Router();

let sesClient: SESv2Client;
const CONFIGURATION_SET_NAME = "Default";

router.post(
  "/",
  expressValidater([
    body("email").trim().isEmail(),
    body("firstName").trim().isLength({ min: 1, max: 50 }),
    body("lastName").trim().notEmpty().isLength({ min: 1, max: 50 }),
    body("message").trim().notEmpty().isLength({ min: 1, max: 500 }),
  ]),
  async (req: Request, res: Response) => {
    if (!sesClient) {
      sesClient = new SESv2Client({});
    }

    const { email, firstName, lastName, message } = req.body;
    const { environment } = AppConfig;

    const command = new SendEmailCommand({
      ConfigurationSetName: CONFIGURATION_SET_NAME,
      FromEmailAddress: "contactme@mine-sweeper.org",
      Destination: {
        ToAddresses: ["jeffwang03@gmail.com"],
      },
      Content: {
        Simple: {
          Subject: {
            Data: `Minesweeper: ContactUs message from ${firstName} ${lastName}`,
          },
          Body: {
            Html: {
              Data: [
                `<b>Environment:</b> ${environment}`,
                `<b>From:</b> ${firstName} ${lastName}`,
                `<b>Email:</b> ${email}`,
                `<b>Message:</b>`,
                message,
              ].join("<br />"),
            },
          },
        },
      },
    });

    try {
      const data = await sesClient.send(command);

      if (data.$metadata.httpStatusCode === 200) {
        logger.info("Send email successfully", data.$metadata);
        return res.status(200).end();
      } else {
        logger.error("Send email error", data.$metadata);
      }
    } catch (err) {
      logger.error("Send email error", err);
    }

    return res.status(500).json({
      error: "Send email error",
    });
  }
);

export default router;
