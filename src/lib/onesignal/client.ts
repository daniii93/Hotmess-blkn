import { getPublicEnv, getServerEnv } from "../../config/env";

export const getOneSignalClientConfig = () => ({
  appId: getPublicEnv().oneSignalAppId,
});

export const getOneSignalServerConfig = () => ({
  appId: getPublicEnv().oneSignalAppId,
  restApiKey: getServerEnv().oneSignalRestApiKey,
});

