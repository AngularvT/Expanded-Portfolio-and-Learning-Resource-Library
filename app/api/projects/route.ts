import { handleProjectsGet, handleProjectsPost } from "@/lib/projects-request";
import { withApiLogging } from "@/lib/request-log";

export const GET = withApiLogging(handleProjectsGet);
export const POST = withApiLogging(handleProjectsPost);
