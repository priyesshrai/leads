const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>()

const WINDOW = 60_000
const MAX_ATTEMPTS = 5

export function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record) {
        rateLimitMap.set(ip, { count: 1, lastAttempt: now })
        return false
    }

    const diff = now - record.lastAttempt

    if (diff > WINDOW) {
        rateLimitMap.set(ip, { count: 1, lastAttempt: now })
        return false
    }

    if (record.count >= MAX_ATTEMPTS) return true

    record.count++
    record.lastAttempt = now
    rateLimitMap.set(ip, record)
    return false
}
