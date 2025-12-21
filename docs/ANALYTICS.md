# Analytics Guide

## Overview
Sentinela uses analytics to track system usage and performance.

## Events Tracked
- Page views
- User actions
- Error occurrences
- Performance metrics

## Implementation
```typescript
import { analytics } from '@/integrations/analytics';
analytics.track('event_name', { property: 'value' });
```