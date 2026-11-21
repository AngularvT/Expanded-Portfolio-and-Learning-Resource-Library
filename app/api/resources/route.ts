import { handleResourcesGet, handleResourcesPost } from "@/lib/resources-request";
import { withApiLogging } from "@/lib/request-log";

export const GET = withApiLogging(handleResourcesGet);
export const POST = withApiLogging(handleResourcesPost);
