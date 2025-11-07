from fastapi import Request, HTTPException, status
from functools import lru_cache
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time

# In-memory rate limiting (for MVP)
# TODO: Migrate to Redis for production with multiple instances
_rate_limit_store: Dict[str, Tuple[int, float]] = {}


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    if request.client:
        return request.client.host
    return "unknown"


def check_rate_limit(
    request: Request,
    max_requests: int = 60,
    window_seconds: int = 60,
) -> bool:
    """
    Check if request is within rate limit
    
    Args:
        request: FastAPI request
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
    
    Returns:
        True if allowed, False if rate limited
    
    Raises:
        HTTPException: If rate limit exceeded
    """
    ip = get_client_ip(request)
    now = time.time()
    
    # Clean old entries
    if ip in _rate_limit_store:
        count, reset_time = _rate_limit_store[ip]
        if now > reset_time:
            # Window expired, reset
            _rate_limit_store[ip] = (1, now + window_seconds)
            return True
        else:
            # Check limit
            if count >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Try again in {int(reset_time - now)} seconds.",
                )
            # Increment count
            _rate_limit_store[ip] = (count + 1, reset_time)
            return True
    else:
        # First request from this IP
        _rate_limit_store[ip] = (1, now + window_seconds)
        return True

