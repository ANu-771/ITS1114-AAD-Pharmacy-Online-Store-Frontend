/**
 * KK PHARMACY ONLINE PHARMACY - PRODUCT SERVICE (js/services/product-service.js)
 * Bridge between UI components and Product API with rich mock fallback data and pharmaceutical metadata.
 */
const ProductService = {
  // Mock Categories matching professional healthcare taxonomy
  _mockCategories: [
    { id: 'medicines', name: 'Medicines', icon: 'bi-capsule', count: '1,200+ Products', desc: 'Over-the-counter & essential remedies' },
    { id: 'prescription', name: 'Prescription Medicines', icon: 'bi-file-earmark-medical', count: '850+ Products', desc: 'Rx medicines requiring prescription' },
    { id: 'equipment', name: 'Medical Equipment', icon: 'bi-heart-pulse', count: '420+ Devices', desc: 'Blood pressure, glucose monitors & devices' },
    { id: 'vitamins', name: 'Vitamins & Supplements', icon: 'bi-lightning-charge', count: '650+ Products', desc: 'Multivitamins, minerals & immune boosters' },
    { id: 'personal-care', name: 'Personal Care', icon: 'bi-droplet-half', count: '980+ Items', desc: 'Skincare, oral care & daily hygiene' },
    { id: 'baby-care', name: 'Baby Care', icon: 'bi-emoji-smile', count: '340+ Items', desc: 'Baby nutrition, skincare & formula' }
  ],

  _mockProducts: [
    {
      id: 1,
      name: 'Amoxicillin 500mg Antibiotic Capsules',
      brand: 'GlaxoSmithKline',
      category: 'medicines',
      categoryName: 'Medicines',
      price: 650.00,
      oldPrice: 750.00,
      rating: 4.8,
      reviewsCount: 42,
      inStock: true,
      requiresPrescription: true,
      image: 'assets/images/medicine_1.png',
      badge: 'Popular',
      description: 'Amoxicillin is a broad-spectrum penicillin-class antibiotic used to treat bacterial infections including respiratory tract infections, ear infections, and skin infections.',
      activeIngredient: 'Amoxicillin Trihydrate 500mg',
      strength: '500mg per capsule',
      dosageForm: 'Hard Gelatin Capsules (30s Blister Pack)',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
      storageInfo: 'Store below 25°C in a dry place away from direct sunlight.'
    },
    {
      id: 2,
      name: 'Digital Blood Pressure Upper Arm Monitor',
      brand: 'Omron Healthcare',
      category: 'equipment',
      categoryName: 'Medical Equipment',
      price: 14850.00,
      oldPrice: 16500.00,
      rating: 4.9,
      reviewsCount: 128,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/bp_monitor.png',
      badge: 'Top Rated',
      description: 'Clinically validated accurate digital blood pressure monitor with IntelliWrap cuff technology, irregular heartbeat detection, and 60-reading memory storage.',
      activeIngredient: 'N/A (Diagnostic Medical Device)',
      strength: 'Oscillometric Sensor Tech',
      dosageForm: 'Upper Arm Cuff & Electronic Console Unit',
      manufacturer: 'Omron Healthcare Co., Ltd. (Japan)',
      storageInfo: 'Store in protective pouch at room temperature.'
    },
    {
      id: 3,
      name: 'Daily Multivitamin & Immunobooster 60s',
      brand: 'Seven Seas',
      category: 'vitamins',
      categoryName: 'Vitamins & Supplements',
      price: 3200.00,
      oldPrice: 3800.00,
      rating: 4.7,
      reviewsCount: 89,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/vitamins_1.png',
      badge: 'Best Value',
      description: 'Comprehensive daily multivitamin formula packed with Vitamin C, Vitamin D3, Zinc, B-Complex, and essential minerals to support vitality and immune health.',
      activeIngredient: 'Multivitamins A, B-Complex, C, D3, E, Zinc, Iron',
      strength: '100% Daily Value RDA',
      dosageForm: 'Amber Glass Bottle (60 Softgels)',
      manufacturer: 'Seven Seas Ltd (UK)',
      storageInfo: 'Keep tightly sealed in a cool, dry place.'
    },
    {
      id: 4,
      name: 'Instant Fingertip Pulse Oximeter OLED',
      brand: 'Beurer',
      category: 'equipment',
      categoryName: 'Medical Equipment',
      price: 4950.00,
      oldPrice: 5900.00,
      rating: 4.8,
      reviewsCount: 74,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/oximeter.png',
      badge: 'Essential',
      description: 'Non-invasive medical fingertip pulse oximeter that accurately measures arterial blood oxygen saturation (SpO2) and heart pulse rate in 5 seconds.',
      activeIngredient: 'N/A (Optical Diagnostic Instrument)',
      strength: 'High Precision Photoelectric Sensor',
      dosageForm: 'Fingertip Device with Lanyard & Case',
      manufacturer: 'Beurer GmbH (Germany)',
      storageInfo: 'Keep clean and dry.'
    },
    {
      id: 5,
      name: 'Accu-Chek Instant Blood Glucose Meter Kit',
      brand: 'Roche Diagnostics',
      category: 'equipment',
      categoryName: 'Medical Equipment',
      price: 8900.00,
      oldPrice: 9800.00,
      rating: 4.9,
      reviewsCount: 210,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/glucometer.png',
      badge: 'Certified',
      description: 'Simple and intuitive blood glucose monitoring kit with target range indicator, instant test strip ejection, and Bluetooth wireless sync capability.',
      activeIngredient: 'N/A (Electrochemical Biosensor)',
      strength: 'Fast 4-Second Test Time',
      dosageForm: 'Meter + Softclix Lancing Pen + 50 Test Strips',
      manufacturer: 'Roche Diabetes Care GmbH',
      storageInfo: 'Store test strips in original closed vial at 4°C to 30°C.'
    },
    {
      id: 6,
      name: 'Paracetamol Extra Strength 500mg (100 Tabs)',
      brand: 'Panadol / Haleon',
      category: 'medicines',
      categoryName: 'Medicines',
      price: 480.00,
      oldPrice: 550.00,
      rating: 4.9,
      reviewsCount: 310,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/paracetamol.png',
      badge: 'Bestseller',
      description: 'Fast and effective relief for mild to moderate pain including headaches, migraines, muscle aches, backaches, toothaches, and reducing fever.',
      activeIngredient: 'Paracetamol BP 500mg',
      strength: '500mg per tablet',
      dosageForm: 'Film-Coated Tablets (10x10 Blister Pack)',
      manufacturer: 'Haleon Consumer Healthcare Ltd',
      storageInfo: 'Store below 30°C. Protect from moisture.'
    },
    {
      id: 7,
      name: 'Ultrasonic Compressor Nebulizer System',
      brand: 'Philips Respironics',
      category: 'equipment',
      categoryName: 'Medical Equipment',
      price: 12500.00,
      oldPrice: 14000.00,
      rating: 4.8,
      reviewsCount: 65,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/nebulizer.png',
      badge: 'Hospital Grade',
      description: 'High-efficiency piston compressor aerosol therapy system designed for treating asthma, COPD, and respiratory allergies for children and adults.',
      activeIngredient: 'N/A (Aerosol Medication Delivery Device)',
      strength: 'Aerosol output 0.35 ml/min',
      dosageForm: 'Compressor Unit + Adult & Pediatric Mask + Chamber',
      manufacturer: 'Philips Respironics Inc.',
      storageInfo: 'Clean medication chamber after each use.'
    },
    {
      id: 8,
      name: 'Non-Contact Infrared Forehead Thermometer',
      brand: 'Microlife',
      category: 'equipment',
      categoryName: 'Medical Equipment',
      price: 6200.00,
      oldPrice: 7500.00,
      rating: 4.7,
      reviewsCount: 94,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/thermometer.png',
      badge: 'Fast Result',
      description: 'Medical grade 1-second instant fever scanner with color-coded fever alarm, silent night mode, and multi-functional surface temperature measurement.',
      activeIngredient: 'N/A (Infrared Thermal Sensor)',
      strength: '±0.2°C High Accuracy',
      dosageForm: 'Handheld Ergonomic Scanner',
      manufacturer: 'Microlife AG (Switzerland)',
      storageInfo: 'Store at room temperature.'
    },
    {
      id: 9,
      name: 'Gentle Baby Wash & Tear-Free Shampoo 250ml',
      brand: 'Gentle Sprout / Sebamed',
      category: 'baby-care',
      categoryName: 'Baby Care',
      price: 2450.00,
      oldPrice: 2800.00,
      rating: 4.9,
      reviewsCount: 56,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/baby_wash.png',
      badge: 'Pediatrician Tested',
      description: 'Gentle hypoallergenic head-to-toe wash and tear-free shampoo formulated with natural chamomile and panthenol to protect delicate infant skin and hair.',
      activeIngredient: 'Chamomile Extract, Panthenol, Mild Surfactants',
      strength: 'pH 5.5 Skin Balanced',
      dosageForm: 'Pump Bottle (250ml)',
      manufacturer: 'Gentle Sprout Healthcare Laboratories',
      storageInfo: 'Store at room temperature.'
    },
    {
      id: 10,
      name: 'Baby Healing Diaper Rash Barrier Cream 226g',
      brand: 'Nurture Baby / Sudocrem',
      category: 'baby-care',
      categoryName: 'Baby Care',
      price: 1850.00,
      oldPrice: 2150.00,
      rating: 4.9,
      reviewsCount: 112,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/sudocrem.png',
      badge: 'Bestseller',
      description: 'Clinically proven protective soothing formula with Zinc Oxide, Calendula, and Panthenol that creates a water-repellent barrier to treat and prevent diaper rash.',
      activeIngredient: 'Zinc Oxide 15.25%, Calendula, Panthenol',
      strength: 'High Moisture Barrier Formula',
      dosageForm: 'Tub (226g / 8 oz)',
      manufacturer: 'Nurture Baby Care Ltd',
      storageInfo: 'Store in a cool, dry place. Keep lid tightly closed.'
    },
    {
      id: 11,
      name: 'Infant Natural Colic Relief Gripe Water 60ml',
      brand: 'Tummy Calm',
      category: 'baby-care',
      categoryName: 'Baby Care',
      price: 780.00,
      oldPrice: 900.00,
      rating: 4.8,
      reviewsCount: 88,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/gripe_water.png',
      badge: 'Fast Colic Relief',
      description: 'Gentle, fast-acting pediatric formula designed to relieve infant gas, stomach discomfort, hiccups, and colic. Includes calibrated oral safety dropper.',
      activeIngredient: 'Dill Seed Oil, Sodium Bicarbonate (Alcohol-Free)',
      strength: 'Pediatric Gentle Strength',
      dosageForm: 'Amber Glass Bottle with Oral Dropper (60ml)',
      manufacturer: 'Tummy Calm Pediatric Solutions',
      storageInfo: 'Store below 25°C. Discard 4 weeks after opening.'
    },
    {
      id: 12,
      name: 'Effervescent Vitamin C 1000mg & Zinc (20 Tabs)',
      brand: 'Vita-Immune / Redoxon',
      category: 'vitamins',
      categoryName: 'Vitamins & Supplements',
      price: 1950.00,
      oldPrice: 2300.00,
      rating: 4.9,
      reviewsCount: 145,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/effervescent_vitc.png',
      badge: 'Immunity Boost',
      description: 'High-potency effervescent orange-flavored Vitamin C 1000mg fortified with Zinc 10mg. Fast-dissolving drink for enhanced cellular immune defense and fatigue reduction.',
      activeIngredient: 'Ascorbic Acid (Vitamin C) 1000mg, Zinc Citrate 10mg',
      strength: '1000mg C + 10mg Zinc per tablet',
      dosageForm: 'Moisture-Sealed Tube (20 Effervescent Tablets)',
      manufacturer: 'Vita-Immune Healthcare AG',
      storageInfo: 'Keep tube tightly capped. Store in a dry place below 25°C.'
    },
    {
      id: 13,
      name: 'Omega-3 Triple Strength Fish Oil 1000mg (90s)',
      brand: 'Vita-Premium / Nature Care',
      category: 'vitamins',
      categoryName: 'Vitamins & Supplements',
      price: 4600.00,
      oldPrice: 5200.00,
      rating: 4.8,
      reviewsCount: 67,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/omega3_fishoil.png',
      badge: 'Cardio & Brain',
      description: 'Molecularly distilled deep-sea fish oil rich in essential Omega-3 fatty acids (EPA 360mg / DHA 240mg) supporting cardiovascular, joint, and cognitive health.',
      activeIngredient: 'Concentrated Purified Fish Oil (EPA 360mg, DHA 240mg)',
      strength: '1000mg per Softgel',
      dosageForm: 'Amber Bottle (90 Enteric-Coated Softgels)',
      manufacturer: 'Vita-Premium Laboratories Ltd',
      storageInfo: 'Store in a cool, dry place.'
    },
    {
      id: 14,
      name: 'Calcium + Vitamin D3 Bone Health Complex (60s)',
      brand: 'Vita-Premium / Caltrate',
      category: 'vitamins',
      categoryName: 'Vitamins & Supplements',
      price: 2800.00,
      oldPrice: 3200.00,
      rating: 4.7,
      reviewsCount: 52,
      inStock: true,
      requiresPrescription: false,
      image: 'assets/images/calcium_d3.png',
      badge: 'Bone Density',
      description: 'Formulated with bioavailable Calcium Carbonate 600mg and Vitamin D3 400IU to promote optimal calcium absorption, bone mineralization, and joint stability.',
      activeIngredient: 'Calcium Carbonate 600mg, Cholecalciferol (Vit D3) 400IU',
      strength: '600mg Ca + 400IU D3',
      dosageForm: 'Sealed Bottle (60 Coated Caplets)',
      manufacturer: 'Vita-Premium Laboratories Ltd',
      storageInfo: 'Keep tightly closed at room temperature.'
    }
  ],

  /**
   * Fetch categories
   */
  getCategories: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      return ProductService._mockCategories;
    }
    try {
      return await CategoryAPI.getAllCategories();
    } catch (e) {
      console.warn('[ProductService] REST API unavailable, falling back to mock categories.');
      return ProductService._mockCategories;
    }
  },

  /**
   * Fetch products with optional category filter
   */
  getProducts: async (category = 'all') => {
    if (CONFIG.USE_MOCK_DATA) {
      if (!category || category === 'all') {
        return ProductService._mockProducts;
      }
      return ProductService._mockProducts.filter(p => p.category === category);
    }
    try {
      if (category && category !== 'all') {
        return await ProductAPI.getProductsByCategory(category);
      }
      return await ProductAPI.getAllProducts();
    } catch (e) {
      console.warn('[ProductService] REST API unavailable, falling back to mock products.');
      if (!category || category === 'all') return ProductService._mockProducts;
      return ProductService._mockProducts.filter(p => p.category === category);
    }
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id) => {
    const numericId = parseInt(id, 10);
    if (CONFIG.USE_MOCK_DATA) {
      return ProductService._mockProducts.find(p => p.id === numericId) || ProductService._mockProducts[0];
    }
    try {
      return await ProductAPI.getProductById(numericId);
    } catch (e) {
      return ProductService._mockProducts.find(p => p.id === numericId) || ProductService._mockProducts[0];
    }
  },

  /**
   * Search products by keyword
   */
  searchProducts: async (query) => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    if (CONFIG.USE_MOCK_DATA) {
      return ProductService._mockProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }
    try {
      return await ProductAPI.searchProducts(query);
    } catch (e) {
      return ProductService._mockProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q)
      );
    }
  }
};
