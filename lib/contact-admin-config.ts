export function isContactManagementEnabled(): boolean {
  return process.env.CONTACT_ADMIN_ENABLED === "true";
}
