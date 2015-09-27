exports = module.exports = function(App) {
  var Model = {
    email: { type: 'string', unique: true, description: 'a unique field' },
    name: { type: 'string', description: 'a number' },
    passwordHash: { type: 'string', private: true, description: 'private fields won\'t be returned by the api' },
    signupDate: { type: 'date', readonly: true, description: 'private fields won\'t be returned by the api' },
  };

  App.models.model = {
    //description: 'The model',
    //definition: Member,
    someClassMethod: function(userObject, password, cb) { },
    },
    instanceMethods: {
      /*
      someInstanceMethod: function(password, cb) {
        var model = this;
      }
      */
    }
  };
};
