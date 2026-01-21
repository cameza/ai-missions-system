# Transfer Window Rules

## Overview

This document outlines the transfer window detection logic and rules implemented in the Transfer Hub system. The system automatically assigns transfers to the correct transfer window based on the transfer date and league-specific rules.

## Window Naming Convention

- **Format**: `YYYY-winter` or `YYYY-summer`
- **Examples**: `2025-winter`, `2025-summer`, `2024-winter`, `2024-summer`
- **Type Safety**: All window IDs are validated using TypeScript branded types

## League-Specific Windows

### Premier League
- **Winter Window**: January 1 - February 1
- **Summer Window**: June 10 - September 1
- **League ID**: `premier-league`

### La Liga
- **Winter Window**: January 1 - February 1
- **Summer Window**: July 1 - September 2
- **League ID**: `la-liga`

### Serie A
- **Winter Window**: January 2 - February 1
- **Summer Window**: July 1 - September 1
- **League ID**: `serie-a`

### Bundesliga
- **Winter Window**: January 1 - February 1
- **Summer Window**: July 1 - September 1
- **League ID**: `bundesliga`

### Ligue 1
- **Winter Window**: January 1 - February 1
- **Summer Window**: June 10 - September 2
- **League ID**: `ligue-1`

### Default Configuration
For leagues without specific configurations, the following default rules apply:
- **Winter Window**: January 1 - February 1
- **Summer Window**: June 1 - September 1
- **League ID**: `default`

## Edge Cases

### Transfers Outside Official Windows

When a transfer occurs outside the official transfer windows:

1. **December Transfers**: Assigned to the following year's winter window
   - Example: December 15, 2024 → `2025-winter`

2. **January-February Transfers**: Assigned to the current year's winter window
   - Example: January 15, 2025 → `2025-winter`

3. **March-June Transfers**: Assigned to the current year's winter window
   - Example: March 15, 2025 → `2025-winter`

4. **July-November Transfers**: Assigned to the current year's summer window
   - Example: October 15, 2025 → `2025-summer`

### Year Boundary Handling

The winter window crosses the year boundary:
- **Start Date**: December 1 of the previous year
- **End Date**: February 1 of the current year
- **Example**: The 2025 winter window runs from December 1, 2024 to February 1, 2025

### Unknown Leagues

When a transfer is from an unknown league:
- System falls back to default window configuration
- Uses standard winter/summer dates
- Maintains proper window naming convention

## Window Metadata

Each window includes the following metadata:

```typescript
interface TransferWindow {
  id: string;           // "2025-winter" or "2025-summer"
  name: string;         // "2025 Winter Window" or "2025 Summer Window"
  startDate: Date;     // Window start date
  endDate: Date;       // Window end date
  status: 'open' | 'closed'; // Current window status
  leagues: string[];   // Applicable league IDs
}
```

### Window Status

- **Open**: Current date is within the window's start and end dates
- **Closed**: Current date is outside the window's start and end dates
- **Real-time**: Status is calculated dynamically based on current date

## Implementation Details

### Window Detection Algorithm

1. **League Lookup**: Find league-specific configuration or use default
2. **Winter Window Check**: Check if transfer date falls within winter window
3. **Summer Window Check**: Check if transfer date falls within summer window
4. **Edge Case Handling**: Assign to nearest window based on month
5. **Year Boundary**: Handle December transfers as next year's winter

### Integration Points

#### Transfer Service Integration
```typescript
// Automatic window assignment during transfer sync
window: detectTransferWindow(transferDate, leagueId)
```

#### API Filtering
```typescript
// Window-based filtering in transfer queries
GET /api/transfers?window=2025-winter
GET /api/transfers?windowStatus=open
```

#### Frontend Usage
```typescript
// Current window detection
const currentWindow = getCurrentWindow();

// Window metadata for UI
const windowInfo = getWindowMetadata(windowId);
```

## API Endpoints

### GET /api/windows
Fetches transfer window metadata.

**Query Parameters:**
- `id` (optional): Specific window ID (e.g., "2025-winter")

**Responses:**
- `200`: Window metadata(s)
- `400`: Invalid window ID format
- `404`: Window not found
- `500`: Server error

**Examples:**
```bash
# Get all recent windows
GET /api/windows

# Get specific window
GET /api/windows?id=2025-winter
```

### POST /api/windows
Creates or updates transfer window metadata (admin functionality).

## Testing

### Unit Tests Coverage

The window detection logic includes comprehensive unit tests covering:

- ✅ Basic window detection (winter/summer)
- ✅ Year boundary handling (December/January)
- ✅ League-specific variations
- ✅ Edge cases (outside windows)
- ✅ Invalid window ID handling
- ✅ Metadata generation
- ✅ Status detection
- ✅ Performance benchmarks

### Test Files
- `src/lib/utils/__tests__/window-detection.test.ts` - 46 tests covering all scenarios

## Performance Considerations

### Detection Speed
- **Target**: < 1ms per detection
- **Benchmark**: 1000 detections in < 100ms
- **Optimization**: Pre-computed window configurations

### Metadata Lookup
- **Target**: < 0.5ms per lookup
- **Benchmark**: 200 lookups in < 50ms
- **Caching**: Window metadata calculated on-demand

### Memory Usage
- **Configuration**: Static league configurations
- **Metadata**: Generated on-demand, no persistent storage
- **Type Safety**: Compile-time validation for window IDs

## Future Enhancements

### Planned Features
1. **Admin UI**: Web interface for managing window configurations
2. **Historical Rules**: Support for different window rules across years
3. **Emergency Windows**: Support for special/emergency transfer windows
4. **Timezone Handling**: Improved timezone support for international transfers
5. **Window Analytics**: Track transfer activity per window

### Configuration Updates
- Window configurations can be updated without code changes
- Support for adding new leagues
- Dynamic rule updates via admin interface
- Configuration validation and error handling

## Troubleshooting

### Common Issues

#### Incorrect Window Assignment
**Problem**: Transfer assigned to wrong window
**Solution**: Check league ID mapping and window configuration dates

#### Year Boundary Issues
**Problem**: December transfers assigned to wrong year
**Solution**: Verify year boundary logic in `detectTransferWindow`

#### Invalid Window IDs
**Problem**: Window ID format validation failures
**Solution**: Ensure format matches `YYYY-winter` or `YYYY-summer` pattern

### Debug Information

Enable debug logging to troubleshoot window detection:
```typescript
console.log('Transfer date:', transferDate);
console.log('League ID:', leagueId);
console.log('Detected window:', detectTransferWindow(transferDate, leagueId));
```

## References

- [Tech Spec §7.1: Service Foundations](../docs/M4-Tech-Spec.md)
- [PRD §6.2.1: Window Context Display](../docs/M4-PRD.md)
- [API Documentation](../docs/API-REFERENCE.md)
- [Database Schema](../docs/DATABASE-SCHEMA.md)

---

**Last Updated**: January 19, 2026  
**Version**: 1.0  
**Maintainer**: Tech Lead
