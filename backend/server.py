"""
ASGI reverse proxy.

The platform supervisor launches `uvicorn server:app` on port 8001, but this
project's real API is a Node/Express app. That Express app is run separately by
supervisor (program: node_backend) on 127.0.0.1:5000. This thin Starlette proxy
forwards every request received on 8001 to the Node server, keeping the
platform's ingress routing (/api -> 8001) fully functional.
"""
import httpx
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import Response

NODE_URL = "http://127.0.0.1:5000"

client = httpx.AsyncClient(base_url=NODE_URL, timeout=120.0)

_EXCLUDED_RESP_HEADERS = {
    "content-encoding",
    "transfer-encoding",
    "connection",
    "content-length",
    "keep-alive",
}


async def proxy(request):
    body = await request.body()
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in ("host", "origin", "referer")
    }
    url = httpx.URL(
        path=request.url.path,
        query=request.url.query.encode("utf-8"),
    )
    try:
        upstream = await client.request(
            request.method,
            url,
            headers=headers,
            content=body,
        )
    except httpx.ConnectError:
        return Response(
            content=b'{"error":"backend unavailable"}',
            status_code=502,
            media_type="application/json",
        )

    resp_headers = {
        k: v
        for k, v in upstream.headers.items()
        if k.lower() not in _EXCLUDED_RESP_HEADERS
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
    )


app = Starlette(
    routes=[
        Route(
            "/{path:path}",
            proxy,
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        )
    ]
)
