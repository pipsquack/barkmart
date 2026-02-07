'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Dog Food',
        slug: 'dog-food',
        description: 'Premium dog food and treats',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cat Food',
        slug: 'cat-food',
        description: 'Quality cat food and treats',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Dog Toys',
        slug: 'dog-toys',
        description: 'Fun and durable dog toys',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cat Toys',
        slug: 'cat-toys',
        description: 'Interactive cat toys and accessories',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Pet Accessories',
        slug: 'pet-accessories',
        description: 'Collars, leashes, and more',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Pet Grooming',
        slug: 'pet-grooming',
        description: 'Grooming supplies and tools',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
