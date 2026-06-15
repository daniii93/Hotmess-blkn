import { Resend } from "resend";
import { getServerEnv } from "../../config/env";

export const createResendClient = () => new Resend(getServerEnv().resendApiKey);

