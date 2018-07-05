const customService = {
  create(data) {
    return Promise.resolve({ customeServiceResult: data });
  },
};

module.exports = function custom(app) {
  app.use('/custom', customService);
};
