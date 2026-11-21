import { handleBlogDelete, handleBlogPatch } from "@/lib/blogs-request";
import { withApiLogging } from "@/lib/request-log";

export const PATCH = withApiLogging(handleBlogPatch);
export const DELETE = withApiLogging(handleBlogDelete);
