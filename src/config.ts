import { Environment } from "./types";

const env: Environment = (process.env.ENV ?? "dev") as Environment;

export const AppConfig = {
  environment: env,
  serviceName: process.env.SERVICE_NAME ?? "Minesweeper Api",
} as const;

switch (env) {
  case "dev":
}
