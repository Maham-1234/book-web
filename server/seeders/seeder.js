const path = require('path');
// Ensure this path correctly points to your .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import all necessary models and the sequelize instance
const { User, Category, Product, Review, sequelize } = require('../src/models');

const seedDatabase = async () => {
  try {
    // 1. Sync all models, dropping existing tables
    await sequelize.sync({ force: true });
    console.log('Database synced successfully. Seeding data...');

    // 2. Create Users
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bookweb.com',
      password: 'AdminPassword1!', // The model hook will hash this
      role: 'admin',
      isEmailVerified: true,
    });

    const buyers = await User.bulkCreate([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'BuyerPassword1!',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'BuyerPassword2!',
      },
    ]);
    console.log(`Created ${buyers.length + 1} users.`);

    // 3. Create Categories
    const categories = await Category.bulkCreate([
      { name: 'Books', slug: 'books' },
      { name: 'Stationery', slug: 'stationery' },
    ]);

    const booksCategory = categories.find((c) => c.slug === 'books');
    const stationeryCategory = categories.find((c) => c.slug === 'stationery');

    const subCategories = await Category.bulkCreate([
      { name: 'Fiction', slug: 'fiction', parentId: booksCategory.id },
      { name: 'Non-Fiction', slug: 'non-fiction', parentId: booksCategory.id },
      { name: 'Journals', slug: 'journals', parentId: stationeryCategory.id },
      { name: 'Pens', slug: 'pens', parentId: stationeryCategory.id },
      {
        name: 'Art Supply',
        slug: 'art-supply',
        parentId: stationeryCategory.id,
      },
    ]);
    console.log(
      `Created ${categories.length + subCategories.length} categories.`
    );

    // 4. Create Products
    const productsData = [
      // --- Fiction ---
      {
        name: 'Dune',
        description: "A mythic and emotionally charged hero's journey.",
        price: 18.99,
        sku: 'BK-FIC-001',
        stock: 75,
        productType: 'Books',
        author: 'Frank Herbert',
        categoryId: subCategories.find((c) => c.slug === 'fiction').id,
      },
      {
        name: 'Project Hail Mary',
        description: 'A lone astronaut must save the earth from disaster.',
        price: 22.5,
        sku: 'BK-FIC-002',
        stock: 50,
        productType: 'Books',
        author: 'Andy Weir',
        categoryId: subCategories.find((c) => c.slug === 'fiction').id,
      },
      // --- Non-Fiction ---
      {
        name: 'Atomic Habits',
        description:
          'An easy & proven way to build good habits & break bad ones.',
        price: 27.0,
        sku: 'BK-NON-001',
        stock: 150,
        productType: 'Books',
        author: 'James Clear',
        categoryId: subCategories.find((c) => c.slug === 'non-fiction').id,
      },
      // --- Journals ---
      {
        name: 'Moleskine Classic Notebook, Large, Ruled',
        description: 'The legendary notebook for thoughts and ideas.',
        price: 19.95,
        sku: 'ST-JNL-001',
        stock: 200,
        productType: 'Stationary',
        brand: 'Moleskine',
        categoryId: subCategories.find((c) => c.slug === 'journals').id,
      },
      // --- Pens ---
      {
        name: 'Lamy Safari Fountain Pen, Charcoal, Fine Nib',
        description: 'A timelessly modern pen.',
        price: 29.6,
        sku: 'ST-PEN-001',
        stock: 90,
        productType: 'Stationary',
        brand: 'Lamy',
        categoryId: subCategories.find((c) => c.slug === 'pens').id,
      },
      // --- Art Supplies ---
      {
        name: 'Prismacolor Premier Colored Pencils, 72-Pack',
        description: 'Soft, thick cores are perfect for shading.',
        price: 55.49,
        sku: 'ART-SUP-002',
        stock: 40,
        productType: 'Stationary',
        brand: 'Prismacolor',
        categoryId: subCategories.find((c) => c.slug === 'art-supply').id,
      },
    ];

    const products = await Product.bulkCreate(
      productsData.map((p) => ({
        ...p,
        // Add a random placeholder image to each product
        images: [`https://picsum.photos/400/600?random=${Math.random()}`],
      }))
    );
    console.log(`Created ${products.length} products.`);

    // 5. Create Reviews
    const reviews = await Review.bulkCreate([
      {
        rating: 5,
        comment: 'Absolutely captivating from start to finish! A must-read.',
        isVerifiedPurchase: true,
        userId: buyers[0].id, // John Doe's review
        productId: products.find((p) => p.sku === 'BK-FIC-001').id, // Review for Dune
      },
      {
        rating: 4,
        comment: 'Very insightful and packed with actionable advice.',
        isVerifiedPurchase: true,
        userId: buyers[1].id, // Jane Smith's review
        productId: products.find((p) => p.sku === 'BK-NON-001').id, // Review for Atomic Habits
      },
      {
        rating: 5,
        comment:
          'The quality of this pen is outstanding. Smooth writing experience.',
        isVerifiedPurchase: false,
        userId: adminUser.id, // Admin's review
        productId: products.find((p) => p.sku === 'ST-PEN-001').id, // Review for Lamy Pen
      },
    ]);
    console.log(`Created ${reviews.length} reviews.`);

    // 6. Final Summary
    console.log('\n✅ Sample data created successfully!');
    console.log('\n🔑 Test Accounts:');
    console.log(`   Admin: ${adminUser.email} / AdminPassword1!`);
    console.log(`   User: ${buyers[0].email} / BuyerPassword1!`);
    console.log(`   User: ${buyers[1].email} / BuyerPassword2!`);

    // Exit the script
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
(async () => {
  await seedDatabase();
})();
