import { handleContactPost } from "@/lib/contact-request";
import { withApiLogging } from "@/lib/request-log";

export const POST = withApiLogging(handleContactPost);
