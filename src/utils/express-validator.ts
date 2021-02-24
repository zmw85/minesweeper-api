import { NextFunction, Request, Response } from "express";
import {
  ValidationChain,
  ValidationError,
  validationResult,
} from "express-validator";
import { consoleLogger as log } from "./logger";

export interface ExpValRequest extends Request {
  validationResult?: {
    message: string;
    errors: ValidationError[];
  };
}

export const expressValidater = (validations: ValidationChain[]) => async (
  req: ExpValRequest,
  res: Response,
  next: NextFunction
) => await validate(req, res, next, validations);

export const validate = async (
  req: ExpValRequest,
  res: Response,
  next: NextFunction,
  validations: ValidationChain[],
  customValidationFn?: (req: ExpValRequest) => ValidationError[]
) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);

  const errorArr: ValidationError[] = [];

  const customErrors: ValidationError[] =
    customValidationFn && typeof customValidationFn === "function"
      ? customValidationFn(req)
      : [];
  if (customErrors?.length) {
    errorArr.push(...customErrors);
  }

  if (!errors.isEmpty()) {
    errorArr.push(...errors.array());
  }

  if (errorArr.length) {
    const errMsg = `express-validator: ${req.method}:${
      req.path
    }: validation failed, errors: ${JSON.stringify(errorArr)}`;

    req.validationResult = {
      message: errMsg,
      errors: errorArr,
    };

    log.error(errMsg, errors, req.body);

    return res.status(400).json({
      errors: errorArr.map((error) => `${error.param}: ${error.msg}`),
    });
  }

  next();
};
