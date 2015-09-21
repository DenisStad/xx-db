/*
 * The database module supports mongoose and sequelize at this moment and adds a layer on top of it, to make basic operations database agnostic.
 * It is *not* trying to replace these ORMs or provide a full ORM agnostic API.
 * You can define models with only primitive types and do basic SCRUD operations.
 * For everything else, such as relationships, joins, mongoose arrays, you should use the ORM directly
 *
 * ## Usage
 *
 * First, define your models.
 * When you define a model and you don't know what the used database will be, try to be as detailed as possible
 * Example:
 * ```
 * App.models.user = {
 *  description: "A user",
 *  definition: {
 *    name: { type: 'string', required: true },
 *    password: { type: 'string', required: true, private: true },
 *    URL: { type: 'string 2083', required: false },
 *  }
 * };
 * ```
 *
 * Now do `App.load('db/convert', 'sequelize');` (or use 'mongoose'). This command takes and additional parameter,
 * which is a list of model names you want to convert, for example `[ "user" ]`. Leave it empty if you want to convert all models.
 *
 * The last step is to call `App.load('mongoose/model')` or `App.load('sequelize/model')`.
 *
 * ## Data types
 * ```
 * 'string [length]',
 * 'text',
 * 'number',
 * 'integer',
 * 'date',
 * 'boolean',
 * 'now',
 * 'blob',
 * 'enum [values...]'
 * ```
 */

var mongooseTypeMap;
var sequelizeTypeMap;

//options
//min max
exports = module.exports = function(App, targetDB, models) {

  var modelNames = models || Object.keys(App.models);
  function convertModel(model) {
    //mongoose
    if (targetDB === 'mongoose') {
      if (!mongooseTypeMap) {
        mongooseTypeMap = {
          'string': String,
          'text': String,
          'number': Number,
          'integer': Number,
          'date': Date,
          'boolean': Boolean,
          'now': Date,
          'blob': Buffer,
          'enum': String,
        };
        //DocumentArray
        //Array
        //ObjectId
        //Mixed
        //
      }
      if (!model.mongooseSchema) model.mongooseSchema = {};
      for (var key in model.definition) {
        var out = {};
        var value = model.definition[key];
        value.hasOwnProperty('required') ? out.required = !!value.required : out.required = true;
        out.private = !!value.private;
        out.readonly = !!value.readonly;
        var type = value.type.trim().split(' ');
        out.type = mongooseTypeMap[type[0]];
        if (!out.type) {
          throw new Error('Unsupported type ' + type[0]);
        }
        if (type[0] === 'string' && type.length > 0) {
          out.maxLength = parseInt(type[1]);
        } else if (type[0] === 'now') {
          out.default = Date.now;
        } else if (type[0] === 'enum') {
          out.enum = type.slice(1);
        }
        if (value.hasOwnProperty('min')) out.min = value.min;
        if (value.hasOwnProperty('max')) out.max = value.max;
        if (value.hasOwnProperty('default')) out.default = value.default;
        if (value.hasOwnProperty('unique')) out.unique = value.unique;
        model.mongooseSchema[key] = out;
      }
      var mongoose = require('mongoose');
      model.findById = function(id, cb) {
        model.Model.findById(id, function(err) {
          cb(arguments);
        });
      };
      model.findOne = function(where, cb) {
        model.Model.findOne(where, cb);
      };
      model.find = function(where, options, cb) {
        if (!cb) cb = options;
        model.Model.find(where, cb);
      };
      model.create = function(obj, cb) {
        model.Model.create(obj, cb);
      };
      model.updateInstance = function(instance, updates, options, cb) {
        if (!cb) {
          cb = options;
          options = { readonly: true, private: true };
        }
        for (var i in model.mongooseSchema) {
          if (!options.readonly && model.mongooseSchema[i].readonly) {
            continue;
          }
          if (!options.private && model.mongooseSchema[i].private) {
            continue;
          }
          if (updates.hasOwnProperty(i)) {
            instance[i] = updates[i];
          }
        }
        instance.save(function(err) { cb(err, instance); });
      };
      model.findByIdAndUpdate = function(id, updates, options, cb) {
        if (!cb) {
          cb = options;
          options = { readonly: true, private: true };
        }
        var updateObj = {};
        for (var i in model.mongooseSchema) {
          if (!options.readonly && model.mongooseSchema[i].readonly) {
            continue;
          }
          if (!options.private && model.mongooseSchema[i].private) {
            continue;
          }
          if (updates.hasOwnProperty(i)) {
            updateObj[i] = updates[i];
          }
        }
        model.Model.findByIdAndUpdate(id, { $set: updateObj }, cb);
      };
      model.findOneAndUpdate = function(obj, updates, options, cb) {
        if (!cb) {
          cb = options;
          options = { readonly: true, private: true };
        }
        var updateObj = {};
        for (var i in model.mongooseSchema) {
          if (!options.readonly && model.mongooseSchema[i].readonly) {
            continue;
          }
          if (!options.private && model.mongooseSchema[i].private) {
            continue;
          }
          if (updates.hasOwnProperty(i)) {
            updateObj[i] = updates[i];
          }
        }
        model.Model.findOneAndUpdate(obj, { $set: updateObj }, cb);
      };
      model.delete = function(params, cb) {
        model.Model.remove(params, cb);
      };
      model.deleteInstance = function(instance, cb) {
        instance.remove(instance, cb);
      };

    } else if (targetDB === 'sequelize') {
      var Sequelize = require('sequelize');
      if (!sequelizeTypeMap) {
        var sequelizeTypeMap = {
          'string': Sequelize.STRING,
          'text': Sequelize.TEXT,
          'number': Sequelize.REAL,
          'integer': Sequelize.INTEGER,
          'date': Sequelize.DATE,
          'boolean': Sequelize.BOOLEAN,
          'now': Sequelize.DATE,
          'blob': Sequelize.BLOB,
          'enum': Sequelize.ENUM
        };
      }
      if (!model.sequelizeSchema) model.sequelizeSchema = {};
      for (var key in model.definition) {
        var out = {};
        var value = model.definition[key];
        value.hasOwnProperty('required') ? out.required = !!value.required : out.required = true;
        out.allowNull = !out.required;
        out.private = !!value.private;
        out.readonly = !!value.readonly;
        var type = value.type.trim().split(' ');
        out.type = sequelizeTypeMap[type[0]];
        if (!out.type) {
          throw new Error('Unsupported type ' + type[0]);
        }
        if (type[0] === 'string' && type.length > 0) {
          out.type = Sequelize.STRING(parseInt(type[1]));
        } else if (type[0] === 'now') {
          out.defaultValue = Sequelize.NOW;
        } else if (type[0] === 'enum') {
          out.type = Sequelize.ENUM(type.slice(1));
        }
        if (value.hasOwnProperty('default')) out.defaultValue = value.default;
        if (value.hasOwnProperty('unique')) out.unique = value.unique;
        if (value.hasOwnProperty('min')) {
          if (!out.validate) out.validate = {};
          out.validate.min = value.min; 
        }
        if (value.hasOwnProperty('max')) {
          if (!out.validate) out.validate = {};
          out.validate.max = value.max; 
        }
        model.sequelizeSchema[key] = out;
      }
      model.findById = function(id, cb) {
        model.Model.findById(id).then(function(instance) { cb(null, instance); }).catch(cb);
      };
      model.findOne = function(where, cb) {
        model.Model.findOne(where).then(function(instance) { cb(null, instance); }).catch(cb);
      };
      model.find = function(where, options, cb) {
        if (!cb) cb = options;
        model.Model.findAll({ where: where }).then(function(instances) { cb(null, instances); }).catch(cb);
      };
      model.create = function(obj, cb) {
        model.Model.create(obj).then(function(instance) { cb(null, instance); }).catch(cb);
      };
      model.updateInstance = function(instance, updates, options, cb) {
        if (!cb) {
          cb = options;
          options = { readonly: true, private: true };
        }
        for (var i in model.sequelizeSchema) {
          if (options.readonly || model.sequelizeSchema[i].readonly) {
            continue;
          }
          if (options.private || model.sequelizeSchema[i].private) {
            continue;
          }
          if (updates.hasOwnProperty(i)) {
            instance.set(i, updates[i]);
          }
        }
        instance.save().then(function(instance) {
          cb(null, instance);
        }).catch(cb);
      };
      model.findByIdAndUpdate = function(id, updates, options, cb) {
        if (!cb) {
          cb = options;
          options = { readonly: true, private: true };
        }
        model.Model.findById(id).then(function(instance) { 
          if (!instance) {
            return cb({ message: 'instance not found' });
          }
          for (var i in model.sequelizeSchema) {
            if (options.readonly || model.sequelizeSchema[i].readonly) {
              continue;
            }
            if (options.private || model.sequelizeSchema[i].private) {
              continue;
            }
            if (updates.hasOwnProperty(i)) {
              instance.set(i, updates[i]);
            }
          }
          return instance.save();
        }).then(function(instance) {
          cb(null, instance);
        }).catch(cb);
      };
      model.findOneAndUpdate = function(obj, updates, options, cb) {
        if (!cb) {
          cb = options;
          options = { readonly: true, private: true };
        }
        model.Model.findOne(id).then(function(instance) { 
          if (!instance) {
            return cb({ message: 'instance not found' });
          }
          for (var i in model.sequelizeSchema) {
            if (options.readonly || model.sequelizeSchema[i].readonly) {
              continue;
            }
            if (options.private || model.sequelizeSchema[i].private) {
              continue;
            }
            if (updates.hasOwnProperty(i)) {
              instance.set(i, updates[i]);
            }
          }
          return instance.save();
        }).then(function(instance) {
          cb(null, instance);
        }).catch(cb);
      };
      model.delete = function(instance, cb) {
        model.Model.destroy({ where: instance }).then(function(instance) { cb(null, instance); }).catch(cb);
      };
      model.deleteInstance = function(instance, cb) {
        instance.destroy().then(function(instance) { cb(null, instance); }).catch(cb);
      };

    } else {
      throw new Error(targetDB + ' is not a supported database/ORM');
    }

  }
  for (var i in App.models) {
    convertModel(App.models[i]);
  }
};
