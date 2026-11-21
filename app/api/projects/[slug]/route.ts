import { handleProjectDelete, handleProjectPatch } from "@/lib/projects-request";
import { withApiLogging } from "@/lib/request-log";

export const PATCH = withApiLogging(handleProjectPatch);
export const DELETE = withApiLogging(handleProjectDelete);
