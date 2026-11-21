export function withApiLogging<Context>(
  handler: (request: Request, context: Context) => Promise<Response>,
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    const response = await handler(request, context);
    const { pathname } = new URL(request.url);
    console.log(`[api] ${request.method} ${pathname} -> ${response.status}`);
    return response;
  };
}
