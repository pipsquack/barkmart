'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('products', [
      // Dog Food
      {
        category_id: 1,
        name: 'Premium Dog Kibble - Chicken & Rice',
        slug: 'premium-dog-kibble-chicken-rice',
        description: 'High-quality dry dog food made with real chicken and brown rice. Perfect for adult dogs of all breeds.',
        price: 49.99,
        stock_quantity: 50,
        image_url: 'https://loremflickr.com/500/500/dog,food',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 1,
        name: 'Grain-Free Dog Food - Salmon',
        slug: 'grain-free-dog-food-salmon',
        description: 'Grain-free formula with real salmon, perfect for dogs with sensitive stomachs.',
        price: 59.99,
        stock_quantity: 35,
        image_url: 'https://loremflickr.com/500/500/puppy,food',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 1,
        name: 'Puppy Food - Chicken Formula',
        slug: 'puppy-food-chicken-formula',
        description: 'Specially formulated nutrition for growing puppies with DHA for brain development.',
        price: 45.99,
        stock_quantity: 40,
        image_url: 'https://loremflickr.com/500/500/puppy',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Cat Food
      {
        category_id: 2,
        name: 'Premium Cat Food - Tuna & Salmon',
        slug: 'premium-cat-food-tuna-salmon',
        description: 'Delicious cat food with real tuna and salmon. High in protein and omega-3 fatty acids.',
        price: 39.99,
        stock_quantity: 60,
        image_url: 'https://loremflickr.com/500/500/cat,food',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        name: 'Kitten Food - Chicken & Milk',
        slug: 'kitten-food-chicken-milk',
        description: 'Complete nutrition for kittens with DHA and essential vitamins.',
        price: 35.99,
        stock_quantity: 45,
        image_url: 'https://loremflickr.com/500/500/kitten,food',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        name: 'Indoor Cat Food - Hairball Control',
        slug: 'indoor-cat-food-hairball-control',
        description: 'Special formula for indoor cats with natural fiber to reduce hairballs.',
        price: 42.99,
        stock_quantity: 50,
        image_url: 'https://loremflickr.com/500/500/cat',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Dog Toys
      {
        category_id: 3,
        name: 'Rope Tug Toy - Heavy Duty',
        slug: 'rope-tug-toy-heavy-duty',
        description: 'Durable rope toy perfect for tug-of-war and dental health.',
        price: 12.99,
        stock_quantity: 100,
        image_url: 'https://loremflickr.com/500/500/dog,toy',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        name: 'Squeaky Ball Set (3 Pack)',
        slug: 'squeaky-ball-set-3-pack',
        description: 'Set of 3 colorful squeaky balls for hours of fetch fun.',
        price: 15.99,
        stock_quantity: 80,
        image_url: 'https://loremflickr.com/500/500/dog,ball',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        name: 'Puzzle Treat Dispenser',
        slug: 'puzzle-treat-dispenser',
        description: 'Interactive toy that dispenses treats as your dog plays, great for mental stimulation.',
        price: 24.99,
        stock_quantity: 55,
        image_url: 'https://loremflickr.com/500/500/dog,play',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Cat Toys
      {
        category_id: 4,
        name: 'Feather Wand Toy',
        slug: 'feather-wand-toy',
        description: 'Interactive feather wand to keep your cat active and entertained.',
        price: 9.99,
        stock_quantity: 75,
        image_url: 'https://loremflickr.com/500/500/cat,toy',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 4,
        name: 'Catnip Mouse (5 Pack)',
        slug: 'catnip-mouse-5-pack',
        description: 'Pack of 5 catnip-filled mice toys. 100% organic catnip.',
        price: 11.99,
        stock_quantity: 90,
        image_url: 'https://loremflickr.com/500/500/kitten,toy',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 4,
        name: 'Laser Pointer Toy',
        slug: 'laser-pointer-toy',
        description: 'Automatic laser pointer for endless entertainment. Keeps cats active.',
        price: 19.99,
        stock_quantity: 65,
        image_url: 'https://loremflickr.com/500/500/cat,play',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Pet Accessories
      {
        category_id: 5,
        name: 'Adjustable Dog Collar - Nylon',
        slug: 'adjustable-dog-collar-nylon',
        description: 'Durable nylon collar with quick-release buckle. Available in multiple colors.',
        price: 14.99,
        stock_quantity: 120,
        image_url: 'https://loremflickr.com/500/500/collar,pet',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 5,
        name: 'Retractable Dog Leash - 16ft',
        slug: 'retractable-dog-leash-16ft',
        description: '16-foot retractable leash with one-button brake and lock system.',
        price: 22.99,
        stock_quantity: 70,
        image_url: 'https://loremflickr.com/500/500/leash,dog',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 5,
        name: 'Pet ID Tags - Personalized',
        slug: 'pet-id-tags-personalized',
        description: 'Custom engraved pet ID tags. Stainless steel construction.',
        price: 8.99,
        stock_quantity: 200,
        image_url: 'https://loremflickr.com/500/500/tag,pet',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Pet Grooming
      {
        category_id: 6,
        name: 'Pet Brush - Slicker Style',
        slug: 'pet-brush-slicker-style',
        description: 'Professional grooming brush for dogs and cats. Removes loose hair and tangles.',
        price: 16.99,
        stock_quantity: 85,
        image_url: 'https://loremflickr.com/500/500/brush,pet',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 6,
        name: 'Pet Shampoo - Oatmeal Formula',
        slug: 'pet-shampoo-oatmeal-formula',
        description: 'Gentle oatmeal shampoo for sensitive skin. Soap-free and pH balanced.',
        price: 13.99,
        stock_quantity: 95,
        image_url: 'https://loremflickr.com/500/500/shampoo,pet',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 6,
        name: 'Nail Clippers - Professional Grade',
        slug: 'nail-clippers-professional-grade',
        description: 'Sharp, stainless steel nail clippers with safety guard.',
        price: 11.99,
        stock_quantity: 110,
        image_url: 'https://loremflickr.com/500/500/clipper,pet',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
  }
};
