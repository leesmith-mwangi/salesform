#!/bin/bash

# Comprehensive Backend Migration Script
# Updates all controllers and models to use new column names for crates/pieces support

echo "======================================"
echo "Backend Migration: Crates/Pieces Support"
echo "======================================"
echo ""

BACKEND_DIR="/home/smith/projects/salesform/backend/src"

# Backup files first
echo "📦 Creating backups..."
mkdir -p /home/smith/projects/salesform/backend/backups
cp -r "$BACKEND_DIR/controllers" /home/smith/projects/salesform/backend/backups/
cp -r "$BACKEND_DIR/models" /home/smith/projects/salesform/backend/backups/
echo "✓ Backups created in /backend/backups/"
echo ""

# Function to replace in file
replace_in_file() {
    local file=$1
    local old=$2
    local new=$3
    
    if [ -f "$file" ]; then
        sed -i "s/$old/$new/g" "$file"
        echo "  ✓ Updated: $(basename $file)"
    fi
}

echo "🔧 Updating Controllers..."
echo ""

# Update inventoryController.js
echo "1. Updating inventoryController.js..."
replace_in_file "$BACKEND_DIR/controllers/inventoryController.js" "quantity_crates" "quantity"
replace_in_file "$BACKEND_DIR/controllers/inventoryController.js" "purchase_price_per_crate" "purchase_price_per_unit"
echo ""

# Update distributionController.js
echo "2. Updating distributionController.js..."
replace_in_file "$BACKEND_DIR/controllers/distributionController.js" "quantity_crates" "quantity"
replace_in_file "$BACKEND_DIR/controllers/distributionController.js" "price_per_crate" "price_per_unit"
echo ""

# Update dashboardController.js
echo "3. Updating dashboardController.js..."
replace_in_file "$BACKEND_DIR/controllers/dashboardController.js" "quantity_crates" "quantity"
replace_in_file "$BACKEND_DIR/controllers/dashboardController.js" "total_crates" "total_quantity"
echo ""

echo "🗄️  Updating Models..."
echo ""

# Update Inventory.js model
echo "4. Updating Inventory.js model..."
replace_in_file "$BACKEND_DIR/models/Inventory.js" "quantity_crates" "quantity"
replace_in_file "$BACKEND_DIR/models/Inventory.js" "purchase_price_per_crate" "purchase_price_per_unit"
echo ""

# Update Distribution.js model
echo "5. Updating Distribution.js model..."
replace_in_file "$BACKEND_DIR/models/Distribution.js" "quantity_crates" "quantity"
replace_in_file "$BACKEND_DIR/models/Distribution.js" "price_per_crate" "price_per_unit"
echo ""

# Update Product.js model
echo "6. Updating Product.js model..."
replace_in_file "$BACKEND_DIR/models/Product.js" "bottles_per_crate" "units_per_package"
replace_in_file "$BACKEND_DIR/models/Product.js" "price_per_crate" "price_per_unit"
echo ""

echo "======================================"
echo "✅ Migration Complete!"
echo "======================================"
echo ""
echo "📝 Summary of changes:"
echo "  - quantity_crates → quantity"
echo "  - purchase_price_per_crate → purchase_price_per_unit"
echo "  - price_per_crate → price_per_unit"
echo "  - bottles_per_crate → units_per_package"
echo ""
echo "⚠️  Next steps:"
echo "  1. Review the changes"
echo "  2. Restart the backend server"
echo "  3. Test the application"
echo ""
echo "💾 Backups saved in: /backend/backups/"
echo ""
