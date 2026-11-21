import { handleContactsGet, handleContactPost } from "@/lib/contact-request";
import { withApiLogging } from "@/lib/request-log";

export const GET = withApiLogging(handleContactsGet);
export const POST = withApiLogging(handleContactPost);
