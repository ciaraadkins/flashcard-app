import Airtable from 'airtable';

/**
 * Process operations in batches to handle Airtable's 10 record limit
 */
export class BatchProcessor {
  private static readonly BATCH_SIZE = 10;

  /**
   * Process updates in batches
   */
  static async batchUpdate(
    table: Airtable.Table<any>, 
    updates: Array<{ id: string; fields: any }>,
    batchSize: number = this.BATCH_SIZE
  ): Promise<void> {
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
      await table.update(batch);
    }
  }

  /**
   * Process creates in batches
   */
  static async batchCreate(
    table: Airtable.Table<any>, 
    records: Array<{ fields: any }>,
    batchSize: number = this.BATCH_SIZE
  ): Promise<any[]> {
    const allCreatedRecords: any[] = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      console.log(`Creating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
      const createdRecords = await table.create(batch);
      allCreatedRecords.push(...createdRecords);
    }
    
    return allCreatedRecords;
  }

  /**
   * Process deletes in batches
   */
  static async batchDelete(
    table: Airtable.Table<any>, 
    recordIds: string[],
    batchSize: number = this.BATCH_SIZE
  ): Promise<void> {
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      console.log(`Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recordIds.length / batchSize)}`);
      await table.destroy(batch);
    }
  }

  /**
   * Process upserts in batches (create or update based on whether ID exists)
   */
  static async batchUpsert(
    table: Airtable.Table<any>, 
    records: Array<{ id?: string; fields: any }>,
    batchSize: number = this.BATCH_SIZE
  ): Promise<any[]> {
    const toCreate: Array<{ fields: any }> = [];
    const toUpdate: Array<{ id: string; fields: any }> = [];
    
    // Separate records by whether they have IDs (update) or not (create)
    records.forEach(record => {
      if (record.id) {
        toUpdate.push({ id: record.id, fields: record.fields });
      } else {
        toCreate.push({ fields: record.fields });
      }
    });
    
    const createdRecords = toCreate.length > 0 ? 
      await this.batchCreate(table, toCreate, batchSize) : [];
    
    if (toUpdate.length > 0) {
      await this.batchUpdate(table, toUpdate, batchSize);
    }
    
    return createdRecords;
  }
}
