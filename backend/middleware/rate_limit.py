from starlette.middleware.base import BaseHTTPMiddleware
import time

class SimpleRatelimit(BaseHTTPMiddleware):
    def __init__(self, app, requests=120, window=60):
        super().__init__(app); self.req=requests; self.win=window; self.bucket={}

    async def dispatch(self, request, call_next):
        ip = request.client.host
        now = time.time()
        cnt, reset = self.bucket.get(ip, (0, now+self.win))
        if now > reset: cnt, reset = 0, now+self.win
        cnt += 1; self.bucket[ip]=(cnt, reset)
        if cnt>self.req:
            from starlette.responses import JSONResponse
            return JSONResponse({"detail":"rate limit"}, status_code=429)
        return await call_next(request)