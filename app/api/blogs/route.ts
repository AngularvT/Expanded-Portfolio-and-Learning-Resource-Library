import { handleBlogsGet, handleBlogsPost } from "@/lib/blogs-request";
import { withApiLogging } from "@/lib/request-log";

export const GET = withApiLogging(handleBlogsGet);
export const POST = withApiLogging(handleBlogsPost);
