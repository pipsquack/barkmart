// Calculate pagination
exports.paginate = (page, limit, totalItems) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 12;
  const offset = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    itemsPerPage,
    offset,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
