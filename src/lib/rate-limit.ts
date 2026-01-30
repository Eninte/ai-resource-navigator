interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * 简单的内存 Rate Limiter
 * 生产环境建议使用 Redis
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  // 清理过期条目
  if (entry && entry.resetAt < now) {
    rateLimitMap.delete(key);
  }
  
  const currentEntry = rateLimitMap.get(key);
  
  if (!currentEntry) {
    // 首次请求
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (currentEntry.count >= maxRequests) {
    // 超过限制
    return { allowed: false, remaining: 0 };
  }
  
  // 增加计数
  currentEntry.count++;
  return { allowed: true, remaining: maxRequests - currentEntry.count };
}

/**
 * 登录失败锁定
 */
export function checkLoginLock(ip: string): boolean {
  const key = `login_lock:${ip}`;
  const entry = rateLimitMap.get(key);
  
  if (!entry) {
    return false; // 未锁定
  }
  
  const now = Date.now();
  if (entry.resetAt < now) {
    rateLimitMap.delete(key);
    return false; // 锁定已过期
  }
  
  return true; // 仍在锁定中
}

export function recordLoginFailure(ip: string): void {
  const key = `login_fail:${ip}`;
  const lockKey = `login_lock:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || entry.resetAt < now) {
    // 重置计数
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + 3600000, // 1 小时
    });
    return;
  }
  
  entry.count++;
  
  if (entry.count >= 5) {
    // 锁定 1 小时
    rateLimitMap.set(lockKey, {
      count: 0,
      resetAt: now + 3600000,
    });
  }
}

export function resetLoginFailures(ip: string): void {
  const key = `login_fail:${ip}`;
  rateLimitMap.delete(key);
}
