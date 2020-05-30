async function queryTable(query, match) {
  let records = await base.getTable(query.table).selectRecordsAsync().then(res => (res.records));
  for (let i = 0; i < records.length; i++) {
    
    if (match == records[i].getCellValue(query.field)) {
      // Found a Match
      return records[i].id;
    }
  }
  // No Matches Found
  return null;
};

async function addRecords(table, newRecords) {
  // A maximum of 50 record creations are allowed at one time, so do it in batches
  while (newRecords.length > 0) {
    await table.createRecordsAsync(newRecords.slice(0, 50));
    newRecords = newRecords.slice(50);
  }
}

async function updateTable(table, apiURL) {
  // Load the MetaData and Fields from the API
  let { metaData, fields } = await fetch(`http://localhost:9000/${apiURL}`).then(res => res.json());

  // Create a list of Records based on the Fields and MetaData
  let newRecords = await Promise.all(
    fields.map(async field => {
      let record = {fields: {}};
  
      await Promise.all(
        metaData.map(async (fieldType) => {
          if (fieldType.type != 'multipleRecordLinks') {
            record.fields[fieldType.fieldName] = field[fieldType.key];
          }
  
          // For Link Fields
          if (fieldType.type == 'multipleRecordLinks') {
            let linkedId = await queryTable(fieldType.query, record.fields[fieldType.query.match]);
            record.fields[fieldType.fieldName] = (linkedId) ? [{id: linkedId}] : null;
          }
        })
      );
  
      return record;
    })
  );

  // Add the Records to the Table
  await addRecords(table, newRecords);
};

output.text(`Working on it...`);

// Add Records to the Companies Table
await updateTable(base.getTable("Companies"), 'teamwork');

// Add Records to the Teamwork Projects Table
await updateTable(base.getTable("Teamwork Projects"), 'teamwork/projects');

output.clear();
output.text(`Done!`);