# FlowTracker Database Setup & Configuration Plan

## 🎯 Overview

This plan will help you transition from localStorage-based admin mode to a full database-backed production system with configurable storage modes.

## 📋 Phase 1: Database Schema Setup

### 1.1 Create Database Schema SQL Script

**File: `database/schema.sql`**

All the required tables with proper relationships, indexes, and RLS policies.

### 1.2 Create Migration Scripts

**File: `database/migrations/`**

- `001_initial_schema.sql` - Core tables
- `002_add_indexes.sql` - Performance indexes
- `003_rls_policies.sql` - Row Level Security
- `004_default_data.sql` - Seed data

### 1.3 Database Validation Scripts

**File: `database/validate.sql`**

Scripts to verify schema integrity and test data operations.

## 📋 Phase 2: Configuration System

### 2.1 Environment-Based Configuration

**Files to create/modify:**

- `src/lib/config.ts` - Central configuration
- `.env.example` - Environment template
- `src/types/config.ts` - Configuration types

### 2.2 Storage Mode Toggle

**Configuration options:**

- `FORCE_STORAGE_MODE` - Override detection
- `ENABLE_DATABASE` - Enable/disable database
- `FALLBACK_TO_STORAGE` - Auto-fallback behavior
- `DEBUG_STORAGE` - Enhanced logging

### 2.3 Runtime Detection

**Smart detection logic:**

- Database connectivity check
- Schema validation
- Automatic fallback
- User preference override

## 📋 Phase 3: Data Migration Tools

### 3.1 Export/Import Utilities

**Files to create:**

- `src/lib/migration/export.ts` - Export from localStorage
- `src/lib/migration/import.ts` - Import to database
- `src/lib/migration/validate.ts` - Data validation
- `src/lib/migration/backup.ts` - Backup utilities

### 3.2 Migration Interface

**Files to create:**

- `src/components/admin/DataMigration.tsx` - UI for migration
- `src/pages/Migration.tsx` - Migration dashboard

## 📋 Phase 4: Testing & Validation

### 4.1 Integration Tests

**Files to enhance:**

- `src/tests/database-integration.test.ts`
- `src/tests/storage-switching.test.ts`
- `src/tests/data-migration.test.ts`

### 4.2 Manual Testing Checklist

**Testing scenarios:**

- Database-only mode
- localStorage-only mode
- Automatic fallback
- Data migration
- Performance comparison

## 📋 Phase 5: Deployment Strategy

### 5.1 Staged Rollout

**Deployment phases:**

1. Database setup (no data migration)
2. Dual-mode testing
3. Data migration
4. Database-primary mode
5. localStorage deprecation

### 5.2 Monitoring & Rollback

**Monitoring setup:**

- Storage mode detection
- Error rate tracking
- Performance metrics
- User feedback collection

---

## 🚀 Implementation Timeline

### Week 1: Database Setup

- [ ] Create database schema
- [ ] Set up Supabase tables
- [ ] Test database connectivity
- [ ] Validate RLS policies

### Week 2: Configuration System

- [ ] Build configuration layer
- [ ] Add storage mode detection
- [ ] Test mode switching
- [ ] Add debug utilities

### Week 3: Data Migration

- [ ] Build migration tools
- [ ] Create migration UI
- [ ] Test data transfer
- [ ] Validate data integrity

### Week 4: Testing & Deployment

- [ ] Integration testing
- [ ] Performance testing
- [ ] Production deployment
- [ ] Monitor and adjust

---

## 📊 Storage Mode Matrix

| Mode           | Primary      | Fallback       | Use Case    |
| -------------- | ------------ | -------------- | ----------- |
| `database`     | Supabase     | localStorage   | Production  |
| `localStorage` | localStorage | None           | Development |
| `hybrid`       | Supabase     | localStorage   | Transition  |
| `auto`         | Detect       | Smart fallback | Default     |

---

## 🔧 Configuration Examples

### Environment Variables

```bash
# Database Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Storage Mode Configuration
FLOWTRACKER_STORAGE_MODE=auto          # auto, database, localStorage, hybrid
FLOWTRACKER_ENABLE_FALLBACK=true       # Enable automatic fallback
FLOWTRACKER_DEBUG_STORAGE=false        # Enable storage debugging
FLOWTRACKER_FORCE_ADMIN_MODE=false     # Force admin mode for testing
```

### Runtime Configuration

```typescript
interface StorageConfig {
  mode: "auto" | "database" | "localStorage" | "hybrid";
  enableFallback: boolean;
  debugMode: boolean;
  adminMode: boolean;
  syncInterval: number;
  retryAttempts: number;
}
```

---

## 🎯 Next Steps

1. **Review this plan** and adjust based on your preferences
2. **Choose implementation approach** (all at once vs. phased)
3. **Set up Supabase database** if not already done
4. **Start with Phase 1** (Database Schema Setup)
5. **Test each phase** before moving to the next

Would you like me to start implementing any specific phase of this plan?
