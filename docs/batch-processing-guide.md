# Batch Processing Guide

## Airtable API Limitations

Airtable's API has a hard limit of 10 records per request for all operations:
- Create: Max 10 records
- Update: Max 10 records  
- Delete: Max 10 records

When dealing with larger datasets, you must implement batch processing.

## BatchProcessor Utility

The `BatchProcessor` class in `/lib/batch-processor.ts` provides methods to handle batch operations:

### 1. Batch Update
```typescript
const updates = records.map(record => ({
  id: record.id,
  fields: { group: 'New Group Name' }
}));

await BatchProcessor.batchUpdate(table, updates);
```

### 2. Batch Create
```typescript
const records = cards.map(card => ({
  fields: { front: card.front, back: card.back }
}));

const createdRecords = await BatchProcessor.batchCreate(table, records);
```

### 3. Batch Delete
```typescript
const recordIds = records.map(r => r.id);
await BatchProcessor.batchDelete(table, recordIds);
```

### 4. Batch Upsert
```typescript
const records = allRecords.map(record => ({
  id: record.id, // Optional, if exists will update
  fields: { /* ... */ }
}));

const results = await BatchProcessor.batchUpsert(table, records);
```

## When to Use Batch Processing

### Required for:
- Group renaming (can have 50+ cards in a set)
- Batch deletion operations
- Mass updates across multiple records
- Creating large flashcard sets

### Not Needed for:
- Single record operations
- Operations on less than 10 records
- Simple SELECT/READ operations

## Common Patterns

### 1. Group Rename API

```typescript
// app/api/groups/rename/route.ts
const records = await table.select({
  filterByFormula: `AND({course} = "${course}", {group} = "${oldName}")`,
}).all();

const updates = records.map(record => ({
  id: record.id,
  fields: { group: newName },
}));

await BatchProcessor.batchUpdate(table, updates);
```

### 2. Bulk Flashcard Creation

```typescript
// lib/airtable.ts
const cleanedCards = cards.map(card => ({ fields: card }));
const records = await BatchProcessor.batchCreate(table, cleanedCards);
```

## Error Handling

The BatchProcessor logs progress for each batch:
```
Processing batch 1/5
Processing batch 2/5
...
```

Handle errors per batch to avoid failing an entire operation:

```typescript
try {
  await BatchProcessor.batchUpdate(table, updates);
} catch (error) {
  console.error('Batch operation failed:', error);
  // Implement retry logic or partial success handling
}
```

## Performance Considerations

- Each batch creates a separate API request
- For large operations (100+ records), consider:
  1. Progress indicators to show operation status
  2. Rate limiting to avoid hitting API quotas
  3. Retry logic for failed batches

## Best Practices

1. **Always use batch processing** for operations on more than 10 records
2. **Log batch progress** for debugging large operations
3. **Handle partial failures** gracefully
4. **Consider user feedback** for long-running operations
5. **Test with large datasets** before deploying

## Future Improvements

1. **Progress Tracking**: Add WebSocket/SSE support for real-time updates
2. **Rate Limiting**: Implement exponential backoff for API calls
3. **Parallel Processing**: Process multiple batches concurrently
4. **Checkpoint System**: Save progress to resume failed operations
