# FlowTracker API Documentation

This document describes the RESTful API endpoints available in the FlowTracker application, implemented using Netlify Edge Functions.

## Base URL

- **Production**: `https://your-site.netlify.app/api`
- **Development**: `http://localhost:8080/api`

## Authentication

Currently, the API does not require authentication. In production, you would implement authentication using JWT tokens or API keys.

## Response Format

All endpoints return JSON responses with the following structure:

### Success Response

```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response

```json
{
  "error": "Error message"
}
```

## API Endpoints

### Health Check

Check if the API is running and healthy.

- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "environment": "netlify-edge",
  "version": "1.0.0"
}
```

---

## Task Management

### Get All Tasks

Retrieve all tasks or filter by date/period.

- **URL**: `/api/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `date` (optional): Filter by date (YYYY-MM-DD format)
  - `period` (optional): Filter by period (`morning` or `afternoon`)

**Examples**:

- `/api/tasks` - Get all tasks
- `/api/tasks?date=2024-01-01` - Get tasks for specific date
- `/api/tasks?period=morning` - Get morning tasks
- `/api/tasks?date=2024-01-01&period=afternoon` - Get afternoon tasks for specific date

**Response**:

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "type": "brain", // or "admin"
      "period": "morning", // or "afternoon"
      "status": "todo", // "todo", "in-progress", "completed"
      "completed": false,
      "priority": "medium", // "low", "medium", "high"
      "tags": ["tag1", "tag2"],
      "timeSpent": 0,
      "pomodoroCount": 0,
      "scheduledFor": "2024-01-01",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z",
      "completedAt": null // or timestamp
    }
  ],
  "count": 1
}
```

### Get Single Task

Retrieve a specific task by ID.

- **URL**: `/api/tasks/:id`
- **Method**: `GET`
- **Response**:

```json
{
  "task": {
    "id": "uuid",
    "title": "Task title"
    // ... other task properties
  }
}
```

### Create Task

Create a new task.

- **URL**: `/api/tasks`
- **Method**: `POST`
- **Body**:

```json
{
  "title": "New task title",
  "description": "Task description",
  "type": "brain", // or "admin"
  "period": "morning", // or "afternoon"
  "priority": "medium", // "low", "medium", "high"
  "tags": ["tag1", "tag2"],
  "timeEstimate": 25,
  "scheduledFor": "2024-01-01"
}
```

**Response**:

```json
{
  "task": {
    "id": "generated-uuid",
    "title": "New task title"
    // ... other task properties
  },
  "message": "Task created successfully"
}
```

### Update Task

Update an existing task.

- **URL**: `/api/tasks/:id`
- **Method**: `PUT`
- **Body**: (partial task object)

```json
{
  "title": "Updated title",
  "status": "completed",
  "timeSpent": 30
}
```

**Response**:

```json
{
  "task": {
    "id": "uuid",
    "title": "Updated title"
    // ... other updated properties
  },
  "message": "Task updated successfully"
}
```

### Delete Task

Delete a task.

- **URL**: `/api/tasks/:id`
- **Method**: `DELETE`
- **Response**:

```json
{
  "message": "Task deleted successfully",
  "taskId": "uuid"
}
```

---

## Day Plans

### Get Day Plan

Retrieve a day plan for a specific date or today.

- **URL**: `/api/day-plans`
- **Method**: `GET`
- **Query Parameters**:
  - `date` (optional): Specific date (YYYY-MM-DD), defaults to today

**Examples**:

- `/api/day-plans` - Get today's plan
- `/api/day-plans?date=2024-01-01` - Get plan for specific date

**Response**:

```json
{
  "dayPlan": {
    "date": "2024-01-01",
    "morningTasks": [
      /* array of tasks */
    ],
    "afternoonTasks": [
      /* array of tasks */
    ],
    "completedTasks": 5,
    "totalTasks": 10,
    "pomodoroCompleted": 3,
    "totalFocusTime": 75,
    "averageFlowScore": 85,
    "currentStreak": 7,
    "achievements": []
  }
}
```

---

## Pomodoro Sessions

### Create Pomodoro Session

Record a new pomodoro session.

- **URL**: `/api/pomodoro/sessions`
- **Method**: `POST`
- **Body**:

```json
{
  "taskId": "uuid", // optional
  "startTime": "2024-01-01T12:00:00Z",
  "endTime": "2024-01-01T12:25:00Z",
  "completed": true,
  "type": "focus", // "focus", "shortBreak", "longBreak"
  "duration": 25,
  "flowScore": 85,
  "distractions": 2
}
```

**Response**:

```json
{
  "session": {
    "id": "generated-uuid",
    "taskId": "uuid"
    // ... other session properties
  },
  "message": "Pomodoro session created successfully"
}
```

### Get Pomodoro Stats

Get statistics for pomodoro sessions.

- **URL**: `/api/pomodoro/stats`
- **Method**: `GET`
- **Query Parameters**:
  - `date` (optional): Specific date (YYYY-MM-DD), defaults to today

**Response**:

```json
{
  "stats": {
    "date": "2024-01-01",
    "count": 5,
    "totalTime": 125,
    "avgFlowScore": 87
  }
}
```

---

## Error Codes

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | Success               |
| 201         | Created               |
| 400         | Bad Request           |
| 404         | Not Found             |
| 405         | Method Not Allowed    |
| 500         | Internal Server Error |

## Implementation Notes

### Current Implementation

- **Technology**: Netlify Edge Functions (Deno runtime)
- **Database**: Mock data (for demonstration)
- **CORS**: Enabled for all origins

### Production Considerations

To use this API in production, you should:

1. **Database Integration**: Replace mock data with actual database calls (Supabase, PostgreSQL, etc.)
2. **Authentication**: Implement JWT or API key authentication
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Add comprehensive input validation
5. **Error Handling**: Improve error handling and logging
6. **CORS Configuration**: Restrict CORS to your domain
7. **Caching**: Implement caching for frequently accessed data

### Frontend Integration

The frontend automatically detects API availability and falls back to localStorage when the API is unavailable:

```typescript
import { taskApi } from "@/lib/storage-api";

// This will try API first, then fallback to localStorage
const tasks = await taskApi.getAll();
```

## Testing the API

You can test the API using:

1. **Built-in Demo Page**: Visit `/api-demo` in your application
2. **cURL**:

```bash
# Health check
curl https://your-site.netlify.app/api/health

# Get all tasks
curl https://your-site.netlify.app/api/tasks

# Create a task
curl -X POST https://your-site.netlify.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","type":"brain","period":"morning","priority":"medium"}'
```

3. **Postman**: Import the endpoints and test interactively
4. **Frontend Integration**: The app automatically uses the API when available

## Support

For questions or issues with the API, please check:

- The built-in demo page at `/api-demo`
- Console logs for debugging information
- Network tab in browser developer tools
