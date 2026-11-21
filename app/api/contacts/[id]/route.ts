import { handleContactDelete, handleContactPatch } from "@/lib/contact-request";
import { withApiLogging } from "@/lib/request-log";

export const PATCH = withApiLogging(handleContactPatch);
export const DELETE = withApiLogging(handleContactDelete);
