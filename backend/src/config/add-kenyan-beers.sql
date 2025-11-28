-- Add 30 popular beer brands sold in Kenya
-- NOTE: This file is deprecated. Current database uses units_per_package and unit_type instead.
-- Use manage-products.js script for adding products to the current schema.

-- This replaces the initial 5 products with a comprehensive list
INSERT INTO products (name, units_per_package, unit_type, description) VALUES
-- Premium Beers
('Heineken', 24, 'crate', 'Heineken Premium Lager'),
('Corona Extra', 24, 'crate', 'Corona Extra Mexican Beer'),
('Stella Artois', 24, 'crate', 'Stella Artois Premium Lager'),
('Budweiser', 24, 'crate', 'Budweiser American Lager'),
('Carlsberg', 24, 'crate', 'Carlsberg Premium Lager'),

-- Local Popular Beers
('Tusker Malt', 24, 'crate', 'Tusker Malt Lager'),
('Tusker Cider', 24, 'crate', 'Tusker Cider Apple Flavored'),
('Tusker Lite', 24, 'crate', 'Tusker Lite Low Alcohol'),
('Pilsner Ice', 24, 'crate', 'Pilsner Ice Extra Strength'),
('Senator Lager', 30, 'crate', 'Senator Premium Lager'),
('Senator Keg', 30, 'crate', 'Senator Keg Draft Beer'),
('Whitecap Crisp', 24, 'crate', 'White Cap Crisp Lager'),

-- Economy Beers
('Chrome', 30, 'crate', 'Chrome Gin Mixed Beer'),
('Summit Lager', 30, 'crate', 'Summit Premium Lager'),
('Kibao', 30, 'crate', 'Kibao Economy Beer'),
('Redd''s', 24, 'crate', 'Redd''s Fruit Flavored Beer'),

-- International Brands Available in Kenya
('Amstel', 24, 'crate', 'Amstel Lager'),
('Hunter''s Gold', 24, 'crate', 'Hunter''s Gold Cider'),
('Savanna Dry', 24, 'crate', 'Savanna Dry Cider'),
('Smirnoff Ice', 24, 'crate', 'Smirnoff Ice Flavored Beer'),

-- Craft & Specialty
('Tusker Baridi', 24, 'crate', 'Tusker Baridi Cold Filtered'),
('Allsopps', 30, 'crate', 'Allsopps Classic Lager'),
('Castle Lager', 24, 'crate', 'Castle Lager South African Beer'),
('Nile Special', 24, 'crate', 'Nile Special Uganda Premium'),
('Legend', 30, 'crate', 'Legend Premium Lager')

ON CONFLICT (name) DO NOTHING;

-- NOTE: Price updates removed - prices are now set per transaction in distributions table
