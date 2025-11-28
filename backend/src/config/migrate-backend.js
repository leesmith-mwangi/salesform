const fs = require('fs');
const path = require('path');

console.log('\n====================================');
console.log('Backend Migration: Crates/Pieces Support');
console.log('====================================\n');

const backendDir = path.join(__dirname, '..');
const backupsDir = path.join(backendDir, 'backups');

// Create backups directory
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

console.log('📦 Creating backups...');
const controllersDir = path.join(backendDir, 'controllers');
const modelsDir = path.join(backendDir, 'models');

// Backup function
function backupDirectory(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

backupDirectory(controllersDir, path.join(backupsDir, 'controllers'));
backupDirectory(modelsDir, path.join(backupsDir, 'models'));
console.log('✓ Backups created\n');

// Replacement patterns
const replacements = {
  'controllers/inventoryController.js': [
    { from: /quantity_crates/g, to: 'quantity' },
    { from: /purchase_price_per_crate/g, to: 'purchase_price_per_unit' },
    { from: /'quantity_crates are required'/g, to: "'quantity is required'" },
    { from: /Added \$\{quantity_crates\} crates/g, to: 'Added ${quantity} units' }
  ],
  'controllers/distributionController.js': [
    { from: /quantity_crates/g, to: 'quantity' },
    { from: /price_per_crate/g, to: 'price_per_unit' },
    { from: /'quantity_crates and price_per_crate are required'/g, to: "'quantity and price_per_unit are required'" },
    { from: /Distributed \$\{quantity_crates\} crates/g, to: 'Distributed ${quantity} units' }
  ],
  'controllers/dashboardController.js': [
    { from: /quantity_crates/g, to: 'quantity' },
    { from: /total_crates_distributed/g, to: 'total_quantity_distributed' },
    { from: /total_crates_received/g, to: 'total_quantity_received' }
  ],
  'models/Inventory.js': [
    { from: /quantity_crates/g, to: 'quantity' },
    { from: /purchase_price_per_crate/g, to: 'purchase_price_per_unit' }
  ],
  'models/Distribution.js': [
    { from: /quantity_crates/g, to: 'quantity' },
    { from: /price_per_crate/g, to: 'price_per_unit' },
    { from: /quantity_crates \* price_per_crate/g, to: 'quantity * price_per_unit' }
  ],
  'models/Product.js': [
    { from: /bottles_per_crate/g, to: 'units_per_package' },
    { from: /price_per_crate/g, to: 'price_per_unit' }
  ]
};

console.log('🔧 Applying migrations...\n');

let filesUpdated = 0;
let totalReplacements = 0;

Object.keys(replacements).forEach(relPath => {
  const filePath = path.join(backendDir, relPath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relPath}`);
    return;
  }

  console.log(`Processing: ${relPath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  replacements[relPath].forEach(({ from, to }) => {
    const matches = (content.match(from) || []).length;
    if (matches > 0) {
      content = content.replace(from, to);
      fileReplacements += matches;
      totalReplacements += matches;
    }
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${fileReplacements} replacements made`);
    filesUpdated++;
  } else {
    console.log(`  - No changes needed`);
  }
});

console.log('\n====================================');
console.log('✅ Migration Complete!');
console.log('====================================\n');
console.log(`📊 Summary:`);
console.log(`  - Files processed: ${Object.keys(replacements).length}`);
console.log(`  - Files updated: ${filesUpdated}`);
console.log(`  - Total replacements: ${totalReplacements}\n`);

console.log('🔄 Changes made:');
console.log('  - quantity_crates → quantity');
console.log('  - purchase_price_per_crate → purchase_price_per_unit');
console.log('  - price_per_crate → price_per_unit');
console.log('  - bottles_per_crate → units_per_package\n');

console.log('⚠️  Next steps:');
console.log('  1. Review the changes in the files');
console.log('  2. Restart the backend server');
console.log('  3. Test adding stock and distributing\n');

console.log('💾 Backups saved in: backend/backups/\n');

process.exit(0);
