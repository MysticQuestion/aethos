import json
import logging
import time
from collections.abc import Callable
from fastapi import Request, Response

logger = logging.getLogger("aethos-calculation")
logging.basicConfig(level=logging.INFO, format="%(message)s")


async def structured_log_middleware(request: Request, call_next: Callable):
    start = time.perf_counter()
    error_category = None
    try:
        response: Response = await call_next(request)
        return response
    except Exception as exc:
        error_category = exc.__class__.__name__
        raise
    finally:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            json.dumps(
                {
                    "event": "calculation_request",
                    "method": request.method,
                    "path": request.url.path,
                    "durationMs": duration_ms,
                    "errorCategory": error_category,
                }
            )
        )
