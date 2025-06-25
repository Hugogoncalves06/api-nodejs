const mongoose = require('mongoose');

// Plugin de pagination pour Mongoose
mongoose.plugin(schema => {
  schema.statics.paginate = function(query, options) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    const countQuery = this.countDocuments(query);
    const docsQuery = this.find(query)
      .skip(skip)
      .limit(limit);
    
    if (options.select) {
      docsQuery.select(options.select);
    }
    
    if (options.sort) {
      docsQuery.sort(options.sort);
    }
    
    return Promise.all([countQuery, docsQuery]).then(([totalDocs, docs]) => {
      const totalPages = Math.ceil(totalDocs / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      return {
        docs,
        totalDocs,
        limit,
        page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      };
    });
  };
});

module.exports = mongoose; 