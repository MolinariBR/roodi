import { startServer } from "@core/bootstrap/server";
import { createApp } from "@src/app";

const app = createApp();
startServer(app);
