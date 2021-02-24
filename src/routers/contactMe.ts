import express, { Request, Response } from "express";
import { body } from "express-validator";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { expressValidater } from "../utils/express-validator";
import { consoleLogger as logger } from "../utils/logger";

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

    const command = new SendEmailCommand({
      ConfigurationSetName: CONFIGURATION_SET_NAME,
      FromEmailAddress: "jeffwang03@gmail.com",
      Destination: {
        ToAddresses: ["contactme@mine-sweeper.org"],
      },
      Content: {
        Simple: {
          Subject: {
            Data: `Minesweeper: ContactUs message from ${firstName} ${lastName}`,
          },
          Body: {
            Html: {
              Data: [
                `<h3>From:</h3> ${firstName} ${lastName}}`,
                `<h3>Email:</h3> ${email}`,
                `<h3>Message:</h3>`,
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
