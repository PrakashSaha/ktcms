const { Client } = require('pg');
const xlsx = require('xlsx');

async function run() {
  console.log('--- READING EXCEL ---');
  const wb = xlsx.readFile('e:/krafttrassure/Products Inventory - Kraft Treasure.xlsx');
  const sheetName = wb.SheetNames[1];
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const client = new Client({
    connectionString: "postgresql://ktcms_user:bAFoWcbWiyrmpE3kuXMTquKLd73ZVXVf@dpg-d82r41favr4c73e5devg-a.singapore-postgres.render.com/ktcms_reab",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('--- CONNECTED TO PG ---');

  const res = await client.query('SELECT id, name FROM products');
  let updated = 0;
  for (const row of res.rows) {
     const dbName = (row.name || '').trim().toLowerCase();
     const matchedRow = rows.find(r => r.Name && r.Name.trim().toLowerCase() === dbName);
     
     if (matchedRow) {
       try {
         await client.query(`UPDATE products SET cosmic_story = $1, ancient_utility = $2, modern_utility = $3 WHERE id = $4`, 
           [matchedRow['Cosmic Story'] || '', matchedRow['Ancient Utility'] || '', matchedRow['Modern Utility'] || '', row.id]);
         console.log(`Updated ${row.name}`);
         updated++;
       } catch (e) {
         console.error(`Failed to update ${row.name}: ${e.message}`);
       }
     }
  }

  console.log(`--- MIGRATION COMPLETE. Updated ${updated} products. ---`);
  await client.end();
}
run();
