import {
  handleResourceDelete,
  handleResourcePatch,
} from "@/lib/resources-request";
import { withApiLogging } from "@/lib/request-log";

export const PATCH = withApiLogging(handleResourcePatch);
export const DELETE = withApiLogging(handleResourceDelete);
