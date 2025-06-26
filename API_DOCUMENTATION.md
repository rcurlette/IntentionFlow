# FlowTracker API Documentation

## Overview

The FlowTracker API provides comprehensive endpoints for task management, flow tracking, analytics, and user settings. All endpoints are deployed as Netlify Edge Functions and are accessible via `/api/*`.

## Base URL

- **Production**: `https://your-domain.netlify.app/api`
- **Development**: `http://localhost:8080/api`

## Authentication

Currently, the API uses a temporary user system. In production, this will be replaced with proper authentication.

## Common Response Format

All API responses follow this format:

```json
{
  "data": {}, // Response data
  "message": "string", // Success/error message (optional)
  "timestamp": "ISO string"
}
```

## Error Handling

Errors return appropriate HTTP status codes with error details:

```json
{
  "error": "Error message",
  "status": 400
}
```

## CORS

All endpoints support CORS with the following headers:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`

---

## Endpoints

### 🔧 System Health

#### Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "netlify-edge",
  "version": "1.0.0"
}
```

---

### 📋 Task Management

#### Get All Tasks

```http
GET /api/tasks
```

**Query Parameters:**

- `date` (optional): Filter by date (YYYY-MM-DD)
- `period` (optional): Filter by period (`morning` | `afternoon`)

**Response:**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "type": "brain" | "admin",
      "period": "morning" | "afternoon",
      "status": "todo" | "in-progress" | "completed",
      "completed": boolean,
      "priority": "low" | "medium" | "high",
      "tags": ["tag1", "tag2"],
      "timeBlock": number,
      "timeEstimate": number,
      "timeSpent": number,
      "pomodoroCount": number,
      "scheduledFor": "YYYY-MM-DD",
      "createdAt": "ISO string",
      "updatedAt": "ISO string",
      "completedAt": "ISO string" | null
    }
  ],
  "count": number
}
```

#### Get Single Task

```http
GET /api/tasks/:id
```

**Response:**

```json
{
  "task": {
    // Task object (same as above)
  }
}
```

#### Create Task

```http
POST /api/tasks
```

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "type": "brain" | "admin" (required),
  "period": "morning" | "afternoon" (required),
  "priority": "low" | "medium" | "high",
  "tags": ["string"],
  "timeBlock": number,
  "timeEstimate": number,
  "scheduledFor": "YYYY-MM-DD"
}
```

**Response:**

```json
{
  "task": {
    // Created task object
  },
  "message": "Task created successfully"
}
```

#### Update Task

```http
PUT /api/tasks/:id
```

**Request Body:** (any task fields to update)

```json
{
  "title": "string",
  "status": "completed",
  "priority": "high"
}
```

**Response:**

```json
{
  "task": {
    // Updated task object
  },
  "message": "Task updated successfully"
}
```

#### Delete Task

```http
DELETE /api/tasks/:id
```

**Response:**

```json
{
  "message": "Task deleted successfully",
  "taskId": "uuid"
}
```

### 📋 Bulk Task Operations

#### Create Multiple Tasks

```http
POST /api/tasks/bulk
```

**Request Body:**

```json
{
  "tasks": [
    {
      "title": "Task 1",
      "type": "brain",
      "period": "morning"
    },
    {
      "title": "Task 2",
      "type": "admin",
      "period": "afternoon"
    }
  ]
}
```

**Response:**

```json
{
  "tasks": [
    // Array of created task objects
  ],
  "count": number,
  "message": "X tasks created successfully"
}
```

#### Update Multiple Tasks

```http
PUT /api/tasks/bulk
```

**Request Body:**

```json
{
  "taskIds": ["uuid1", "uuid2"],
  "updates": {
    "priority": "high",
    "status": "completed"
  }
}
```

**Response:**

```json
{
  "updatedTaskIds": ["uuid1", "uuid2"],
  "updates": {},
  "count": number,
  "message": "X tasks updated successfully"
}
```

#### Delete Multiple Tasks

```http
DELETE /api/tasks/bulk
```

**Request Body:**

```json
{
  "taskIds": ["uuid1", "uuid2"]
}
```

**Response:**

```json
{
  "deletedTaskIds": ["uuid1", "uuid2"],
  "count": number,
  "message": "X tasks deleted successfully"
}
```

### 📋 Task Templates

#### Get Task Templates

```http
GET /api/tasks/templates
```

**Response:**

```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Template name",
      "description": "Template description",
      "type": "brain" | "admin",
      "period": "morning" | "afternoon",
      "priority": "low" | "medium" | "high",
      "tags": ["string"],
      "timeEstimate": number,
      "category": "string",
      "createdAt": "ISO string"
    }
  ],
  "count": number
}
```

#### Create Task Template

```http
POST /api/tasks/templates
```

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string",
  "type": "brain" | "admin" (required),
  "period": "morning" | "afternoon" (required),
  "priority": "low" | "medium" | "high",
  "tags": ["string"],
  "timeEstimate": number,
  "category": "string"
}
```

---

### 📅 Day Plans

#### Get Day Plan

```http
GET /api/day-plans
```

**Query Parameters:**

- `date` (optional): Specific date (YYYY-MM-DD), defaults to today

**Response:**

```json
{
  "dayPlan": {
    "date": "YYYY-MM-DD",
    "morningTasks": [
      // Array of task objects
    ],
    "afternoonTasks": [
      // Array of task objects
    ],
    "completedTasks": number,
    "totalTasks": number,
    "pomodoroCompleted": number,
    "totalFocusTime": number,
    "averageFlowScore": number,
    "currentStreak": number,
    "achievements": [
      // Array of achievement objects
    ]
  }
}
```

---

### 🍅 Pomodoro Sessions

#### Create Pomodoro Session

```http
POST /api/pomodoro/sessions
```

**Request Body:**

```json
{
  "taskId": "uuid (optional)",
  "duration": number,
  "type": "focus" | "shortBreak" | "longBreak",
  "completed": boolean,
  "flowScore": number,
  "distractions": number,
  "startTime": "ISO string",
  "endTime": "ISO string (optional)"
}
```

**Response:**

```json
{
  "session": {
    "id": "uuid",
    "taskId": "uuid",
    "duration": number,
    "type": "focus" | "shortBreak" | "longBreak",
    "completed": boolean,
    "flowScore": number,
    "distractions": number,
    "startTime": "ISO string",
    "endTime": "ISO string"
  },
  "message": "Pomodoro session created successfully"
}
```

#### Get Pomodoro Statistics

```http
GET /api/pomodoro/stats
```

**Query Parameters:**

- `date` (optional): Specific date (YYYY-MM-DD), defaults to today

**Response:**

```json
{
  "stats": {
    "date": "YYYY-MM-DD",
    "count": number,
    "totalTime": number,
    "avgFlowScore": number
  }
}
```

---

### 🌊 Flow Tracking

#### Get Flow Entries

```http
GET /api/flow/entries
```

**Query Parameters:**

- `days` (optional): Number of days to fetch (default: 7)
- `date` (optional): Specific date (YYYY-MM-DD)

**Response:**

```json
{
  "entries": [
    {
      "id": "uuid",
      "timestamp": "ISO string",
      "activity": "string",
      "activityType": "brain" | "admin" | "break" | "other",
      "flowRating": number,
      "mood": number,
      "energyLevel": number,
      "location": "string",
      "notes": "string",
      "tags": ["string"],
      "duration": number,
      "createdAt": "ISO string"
    }
  ],
  "count": number,
  "dateRange": {
    "days": number,
    "date": "string"
  }
}
```

#### Create Flow Entry

```http
POST /api/flow/entries
```

**Request Body:**

```json
{
  "activity": "string (required)",
  "activityType": "brain" | "admin" | "break" | "other",
  "flowRating": number, // 1-5 (required)
  "mood": number, // 1-5 (required)
  "energyLevel": number, // 1-5 (required)
  "location": "string",
  "notes": "string",
  "tags": ["string"],
  "duration": number,
  "timestamp": "ISO string"
}
```

**Response:**

```json
{
  "entry": {
    // Created flow entry object
  },
  "message": "Flow entry created successfully"
}
```

#### Get Flow Analytics

```http
GET /api/flow/analytics
```

**Query Parameters:**

- `days` (optional): Number of days for analysis (default: 30)

**Response:**

```json
{
  "analytics": {
    "peakFlowHours": [9, 10, 14, 15],
    "lowFlowHours": [12, 16, 17],
    "bestActivitiesForMorning": ["Deep work", "Coding"],
    "bestActivitiesForAfternoon": ["Meetings", "Admin tasks"],
    "activitiesToAvoid": ["Social media"],
    "weeklyTrends": {
      "Monday": {
        "day": "Monday",
        "avgFlow": 3.8,
        "bestActivity": "Deep work"
      }
    },
    "improvementSuggestions": ["string"]
  },
  "dateRange": {
    "days": number
  }
}
```

#### Get Flow Tracking Settings

```http
GET /api/flow/settings
```

**Response:**

```json
{
  "settings": {
    "isEnabled": boolean,
    "interval": number,
    "quietHours": {
      "start": "HH:MM",
      "end": "HH:MM"
    },
    "trackingDays": [1, 2, 3, 4, 5],
    "autoDetectActivity": boolean,
    "showFlowInsights": boolean,
    "minimumEntriesForInsights": number,
    "promptStyle": "gentle" | "persistent" | "minimal"
  }
}
```

#### Update Flow Tracking Settings

```http
PUT /api/flow/settings
```

**Request Body:** (any settings fields to update)

```json
{
  "isEnabled": boolean,
  "interval": number,
  "quietHours": {
    "start": "HH:MM",
    "end": "HH:MM"
  },
  "trackingDays": [number]
}
```

---

### 📊 Analytics

#### Get Task Analytics

```http
GET /api/analytics/tasks
```

**Query Parameters:**

- `range` (optional): Date range (`7d` | `30d` | `90d`)

**Response:**

```json
{
  "analytics": {
    "totalTasks": number,
    "completedTasks": number,
    "completionRate": number,
    "avgTasksPerDay": number,
    "productivityScore": number,
    "typeBreakdown": {
      "brain": number,
      "admin": number
    },
    "periodBreakdown": {
      "morning": number,
      "afternoon": number
    },
    "tagAnalytics": [
      {
        "tag": "string",
        "count": number,
        "completionRate": number
      }
    ],
    "timeSpentByType": {
      "brain": number,
      "admin": number
    },
    "pomodoroEfficiency": number
  },
  "dateRange": "string"
}
```

#### Get Productivity Insights

```http
GET /api/analytics/productivity
```

**Query Parameters:**

- `range` (optional): Date range (`7d` | `30d` | `90d`)

**Response:**

```json
{
  "insights": {
    "overallScore": number,
    "trends": {
      "tasksCompleted": {
        "current": number,
        "previous": number,
        "change": number
      },
      "focusTime": {
        "current": number,
        "previous": number,
        "change": number
      },
      "flowScore": {
        "current": number,
        "previous": number,
        "change": number
      }
    },
    "recommendations": ["string"],
    "bestPerformingDays": ["string"],
    "improvementAreas": ["string"]
  },
  "dateRange": "string"
}
```

#### Get Activity Patterns

```http
GET /api/analytics/patterns
```

**Query Parameters:**

- `range` (optional): Date range (`7d` | `30d` | `90d`)

**Response:**

```json
{
  "patterns": {
    "hourlyFlow": [
      {
        "hour": number,
        "avgFlow": number,
        "taskCount": number
      }
    ],
    "dailyPatterns": {
      "Monday": {
        "avgProductivity": number,
        "bestActivity": "string"
      }
    },
    "activityCorrelations": [
      {
        "activity": "string",
        "bestTime": "string",
        "avgFlow": number
      }
    ]
  },
  "dateRange": "string"
}
```

#### Get Trend Analysis

```http
GET /api/analytics/trends
```

**Query Parameters:**

- `range` (optional): Date range (`7d` | `30d` | `90d`)

**Response:**

```json
{
  "trends": {
    "productivityTrend": "increasing" | "decreasing" | "stable",
    "weeklyAverage": number,
    "monthlyGrowth": number,
    "streakAnalysis": {
      "currentStreak": number,
      "avgStreakLength": number,
      "longestStreak": number
    },
    "seasonalPatterns": [
      {
        "period": "string",
        "productivity": number,
        "trend": "string"
      }
    ],
    "forecastedProductivity": number
  },
  "dateRange": "string"
}
```

---

### ⚙️ User Settings

#### Get User Settings

```http
GET /api/settings
```

**Response:**

```json
{
  "settings": {
    "theme": "light" | "dark",
    "colorTheme": "vibrant" | "accessible",
    "focusDuration": number,
    "shortBreakDuration": number,
    "longBreakDuration": number,
    "sessionsBeforeLongBreak": number,
    "autoStartBreaks": boolean,
    "autoStartPomodoros": boolean,
    "notificationsEnabled": boolean,
    "soundEnabled": boolean,
    "dailyGoal": number
  }
}
```

#### Update User Settings

```http
PUT /api/settings
```

**Request Body:** (any settings fields to update)

```json
{
  "theme": "dark",
  "focusDuration": 25,
  "notificationsEnabled": true
}
```

**Response:**

```json
{
  "settings": {
    // Updated settings object
  },
  "message": "Settings updated successfully"
}
```

---

### 🏆 Achievements

#### Get User Achievements

```http
GET /api/achievements
```

**Response:**

```json
{
  "achievements": [
    {
      "id": "uuid",
      "type": "streak" | "completion" | "focus" | "milestone",
      "title": "string",
      "description": "string",
      "icon": "string",
      "earnedAt": "ISO string",
      "metadata": {}
    }
  ],
  "count": number
}
```

#### Create Achievement

```http
POST /api/achievements
```

**Request Body:**

```json
{
  "type": "streak" | "completion" | "focus" | "milestone" (required),
  "title": "string (required)",
  "description": "string (required)",
  "icon": "string",
  "metadata": {}
}
```

**Response:**

```json
{
  "achievement": {
    // Created achievement object
  },
  "message": "Achievement unlocked!"
}
```

---

### 🔥 Streaks

#### Get User Streaks

```http
GET /api/streaks
```

**Response:**

```json
{
  "streaks": {
    "currentStreak": number,
    "longestStreak": number,
    "lastActivityDate": "YYYY-MM-DD"
  }
}
```

#### Update User Streaks

```http
PUT /api/streaks
```

**Request Body:**

```json
{
  "currentStreak": number,
  "longestStreak": number,
  "lastActivityDate": "YYYY-MM-DD"
}
```

**Response:**

```json
{
  "streaks": {
    // Updated streaks object
  },
  "message": "Streaks updated successfully"
}
```

---

## Testing

### Run API Tests

```bash
# Test all endpoints
npm run test:api

# Test against specific environment
API_BASE_URL=https://your-domain.netlify.app npm run test:api

# Run all tests (unit + API)
npm run test:all
```

### Test Individual Endpoints

```bash
# Health check
curl https://your-domain.netlify.app/api/health

# Get tasks
curl https://your-domain.netlify.app/api/tasks

# Create task
curl -X POST https://your-domain.netlify.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","type":"brain","period":"morning"}'
```

---

## Deployment

The API is automatically deployed as Netlify Edge Functions when you deploy your site. The edge functions are configured in `netlify.toml`:

```toml
[[edge_functions]]
  function = "api"
  path = "/api/*"
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding rate limiting based on your usage patterns.

## Monitoring

Monitor your API usage through the Netlify dashboard. Each edge function call is logged and can be monitored for performance and errors.
