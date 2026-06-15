export type HealthCheck = {
  name:
    | "vercel_logs"
    | "supabase_logs"
    | "stripe_webhook_logs"
    | "paypal_webhook_logs"
    | "edge_function_logs"
    | "error_logging"
    | "audit_logs";
  status: "ok" | "warning" | "down";
  message?: string;
};

export const getOverallHealth = (checks: HealthCheck[]): HealthCheck["status"] => {
  if (checks.some((check) => check.status === "down")) return "down";
  if (checks.some((check) => check.status === "warning")) return "warning";
  return "ok";
};
