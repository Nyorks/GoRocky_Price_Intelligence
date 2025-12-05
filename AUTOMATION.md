# 🤖 Automation & Scheduling Guide

This document explains how the automated scraping system works and how to configure it.

## 📋 Overview

The automation system uses **node-cron** to schedule price scrapes automatically. It includes:

- ✅ Configurable schedule (cron expressions)
- ✅ Automatic retry logic on failures
- ✅ Prevent overlapping runs
- ✅ Comprehensive logging
- ✅ Web UI for management

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Scheduler Service                      │
│  (scheduler.ts - Manages cron jobs)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Scheduled Scraper Service                   │
│  (scheduledScraper.ts - Retry logic & locking)          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│               Scrape Orchestrator                        │
│  (scrapeOrchestrator.ts - Actual scraping)              │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Enable Automation (Frontend)

1. Go to **Dashboard**
2. Look for the **🤖 Automated Scraping** panel
3. Click **▶ Enable Automation**
4. Optionally adjust the schedule in **⚙️ Settings**

### 2. Enable Automation (API)

```bash
# Enable the scheduler
curl -X POST http://localhost:3001/api/schedule/enable

# Disable the scheduler
curl -X POST http://localhost:3001/api/schedule/disable
```

### 3. Configure Schedule

```bash
# Update schedule to run every hour
curl -X PUT http://localhost:3001/api/schedule/config \
  -H "Content-Type: application/json" \
  -d '{
    "cronExpression": "0 * * * *",
    "maxRetries": 3,
    "description": "Hourly price check"
  }'
```

## ⏰ Cron Expression Guide

| Pattern | Description |
|---------|-------------|
| `0 * * * *` | Every hour |
| `0 3 * * *` | Daily at 3:00 AM |
| `0 */6 * * *` | Every 6 hours |
| `*/15 * * * *` | Every 15 minutes |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `0 0 1 * *` | First day of every month at midnight |

### Cron Format

```
 *  *  *  *  *
 │  │  │  │  │
 │  │  │  │  └─── Day of Week (0-7, 0 or 7 = Sunday)
 │  │  │  └────── Month (1-12)
 │  │  └───────── Day of Month (1-31)
 │  └──────────── Hour (0-23)
 └─────────────── Minute (0-59)
```

## 🔧 Configuration Options

### Database Model: `schedule_config`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isEnabled` | Boolean | `false` | Enable/disable automation |
| `cronExpression` | String | `"0 3 * * *"` | When to run (daily at 3 AM) |
| `maxRetries` | Number | `3` | How many retries on failure |
| `retryDelayMs` | Number | `5000` | Delay between retries (5 seconds) |
| `description` | String | - | Human-readable schedule description |
| `lastRunAt` | DateTime | - | When was the last successful run |
| `nextRunAt` | DateTime | - | When is the next scheduled run |

## 🔄 Retry Logic

When a scrape fails, the system will:

1. Log the error
2. Wait `retryDelayMs` milliseconds
3. Retry up to `maxRetries` times
4. If all retries fail, mark the job as failed and log details

Example retry sequence:
```
Attempt 1: FAIL → wait 5s
Attempt 2: FAIL → wait 5s
Attempt 3: FAIL → wait 5s
Attempt 4: FAIL → Give up, log failure
```

## 🔒 Overlapping Prevention

The system uses an in-memory lock to prevent multiple scrapes from running simultaneously:

```typescript
let isScrapingInProgress = false;

// Before starting
if (isScrapingInProgress) {
  return { error: 'Scrape already in progress' };
}

isScrapingInProgress = true;
try {
  // ... perform scrape ...
} finally {
  isScrapingInProgress = false; // Always release lock
}
```

## 📊 Logging & Monitoring

### ScrapeLog Fields

| Field | Description |
|-------|-------------|
| `status` | `running`, `success`, `partial`, `failed` |
| `isScheduled` | Was this triggered by scheduler? |
| `retryCount` | How many retries were attempted |
| `startedAt` | When the scrape started |
| `completedAt` | When the scrape completed |
| `runtime` | How long it took (milliseconds) |
| `totalMappings` | Total products to scrape |
| `successCount` | Successfully scraped |
| `failureCount` | Failed to scrape |
| `errorDetails` | JSON array of errors |

### View Recent Logs

```bash
# Get recent scrape logs
curl http://localhost:3001/api/scrape/logs?limit=10

# Get current status
curl http://localhost:3001/api/scrape/status
```

## 🎛 API Endpoints

### Schedule Management

```http
GET    /api/schedule/config      # Get current configuration
PUT    /api/schedule/config      # Update configuration
POST   /api/schedule/enable      # Enable automation
POST   /api/schedule/disable     # Disable automation
```

### Scraping

```http
POST   /api/scrape/run           # Trigger manual scrape
GET    /api/scrape/status        # Get current status
GET    /api/scrape/logs          # Get recent logs
```

## 🛠 Development

### Disable Scheduler in Development

**Option 1: Environment Variable**
```bash
# In .env
DISABLE_SCHEDULER=true
```

**Option 2: Database**
```sql
UPDATE schedule_config SET is_enabled = false;
```

**Option 3: Code**
```typescript
// Comment out in src/index.ts
// await initializeScheduler();
```

### Testing the Scheduler

```typescript
// Test with a short interval (every minute)
await scheduleApi.updateConfig({
  cronExpression: '* * * * *',
  maxRetries: 2,
});
```

### View Scheduler Logs

The scheduler logs extensively:

```
🚀 Initializing scheduler...
✅ Scheduler started with expression: 0 3 * * *
   Description: Daily price scrape at 3:00 AM
   Next run: 2024-12-06T03:00:00.000Z
✅ Scheduler initialized successfully

⏰ Scheduled scrape triggered
🔄 Scrape attempt 1/4
✅ Scrape completed successfully on attempt 1
```

## 🚨 Troubleshooting

### Scheduler Not Running

1. Check if enabled:
   ```bash
   curl http://localhost:3001/api/schedule/config
   ```

2. Check server logs for errors

3. Verify cron expression is valid:
   ```bash
   # Should return true
   node -e "console.log(require('node-cron').validate('0 3 * * *'))"
   ```

### Scrapes Failing

1. Check scrape logs for error details:
   ```bash
   curl http://localhost:3001/api/scrape/logs
   ```

2. Increase `maxRetries` if transient network issues

3. Increase `retryDelayMs` if rate-limited

### Overlapping Runs

If you see "Scrape already in progress" frequently:
- Your scrapes are taking longer than the interval
- Increase the interval or optimize scraping
- Check for stuck scrapes (restart server to clear lock)

## 📈 Best Practices

### 1. **Choose Appropriate Intervals**

- **Hourly** (`0 * * * *`): Good for frequently changing prices
- **Daily at 3 AM** (`0 3 * * *`): Standard for daily price checks
- **Every 6 hours** (`0 */6 * * *`): Balance between frequency and load

### 2. **Set Reasonable Retries**

- Default `3` retries works well
- Increase for unstable networks
- Don't set too high (wastes time on persistent failures)

### 3. **Monitor Logs**

- Check success rate regularly
- Investigate persistent failures
- Adjust schedule if needed

### 4. **Respect Rate Limits**

- Set appropriate `SCRAPE_RATE_LIMIT_MS` in `.env`
- Don't scrape too frequently
- Respect robots.txt

### 5. **Use Timezone Awareness**

- Scheduler uses UTC by default
- Adjust cron expression for your timezone
- Example: 3 AM PST = 11 AM UTC → `0 11 * * *`

## 🔐 Production Considerations

### 1. **Persistent Locks**

For multi-instance deployments, use Redis instead of in-memory lock:

```typescript
import Redis from 'ioredis';
const redis = new Redis();

const lockKey = 'scrape:lock';
const acquired = await redis.set(lockKey, '1', 'EX', 300, 'NX');
```

### 2. **Better Scheduling**

Consider **agenda** or **bull** for more robust job scheduling:

```bash
npm install agenda
# or
npm install bull
```

### 3. **Monitoring & Alerts**

- Set up alerts for consecutive failures
- Monitor scrape duration
- Track success rate over time

### 4. **Graceful Shutdown**

Already implemented! The server handles SIGINT/SIGTERM:

```typescript
process.on('SIGINT', () => {
  stopScheduler();
  process.exit(0);
});
```

## 📚 Related Files

| File | Purpose |
|------|---------|
| `services/scheduler.ts` | Main scheduler service |
| `services/scheduledScraper.ts` | Retry logic & execution wrapper |
| `services/scrapeOrchestrator.ts` | Actual scraping logic |
| `repositories/scheduleConfigRepository.ts` | Database operations |
| `routes/schedule.ts` | API endpoints |
| `components/ScheduleStatus.tsx` | Frontend UI |

---

**Need help?** Check the server logs or create an issue in the repository.

