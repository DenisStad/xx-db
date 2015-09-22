var should = require('should');
var async = require('async');

var App = require('xerxes')();

App.models.testModel = {
  definition: {
    string: { type: 'string', required: false },
    stringLen: { type: 'string 123', required: false},
    text: { type: 'text', required: false},
    number: { type: 'number', required: false },
    integer: { type: 'integer', required: false },
    date: { type: 'date', required: false },
    bool: { type: 'boolean', required: false },
    now: { type: 'now', required: false },
    blob: { type: 'blob', required: false },
    enum: { type: 'enum a b c d ', required: false },

    req: { type: 'string', required: true },
    nreq: { type: 'string', required: false },
    dreq: { type: 'string' },

    minmax: { type: 'number', min: -3, max: 5.4, required: false },
  }
};

var setup = App.load('../convert', 'mongoose');

App.models.testModel.mongooseSchema.should.be.ok();

var schema = App.models.testModel.mongooseSchema;
schema.string.type.should.equal(String);
schema.stringLen.type.should.equal(String);
schema.stringLen.maxLength.should.equal(123);
schema.text.type.should.equal(String);
schema.number.type.should.equal(Number);
schema.integer.type.should.equal(Number);
schema.date.type.should.equal(Date);
schema.bool.type.should.equal(Boolean);
schema.now.type.should.equal(Date);
schema.now.default.should.equal(Date.now);
schema.blob.type.should.equal(Buffer);
schema.enum.type.should.equal(String);
schema.enum.enum.length.should.equal(4);
schema.enum.enum[0].should.equal('a');
schema.enum.enum[1].should.equal('b');
schema.enum.enum[2].should.equal('c');
schema.enum.enum[3].should.equal('d');

schema.req.required.should.equal(true);
schema.nreq.required.should.equal(false);
schema.dreq.required.should.equal(true);

schema.minmax.type.should.equal(Number);
schema.minmax.min.should.equal(-3);
schema.minmax.max.should.equal(5.4);

App.load('xx-mongoose/connect', 'mongodb://localhost/xxmongoose');
App.load('xx-mongoose/model');

var context = {};
async.series([
  function(cb) {
    App.models.testModel.delete({ }, function(err, obj) {
      if (err) return cb(err);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.create({ string: 'aa', req: 'r', dreq: 'r' }, function(err, obj) {
      if (err) return cb(err);
      obj.string.should.equal('aa');
      obj.id.should.be.ok();
      context.obj = obj;
      cb();
    });
  },
  function(cb) {
    App.models.testModel.find({ string: 'aa' }, function(err, obj) {
      if (err) return cb(err);
      obj.length.should.equal(1);
      obj[0].string.should.equal('aa');
      obj[0].id.should.be.ok();
      obj[0].id.should.equal(context.obj.id);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.findById(context.obj.id, function(err, obj) {
      if (err) return cb(err);
      obj.string.should.equal('aa');
      obj.id.should.be.ok();
      obj.id.should.equal(context.obj.id);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.findOne({ string: 'aa' }, function(err, obj) {
      if (err) return cb(err);
      obj.string.should.equal('aa');
      obj.id.should.be.ok();
      obj.id.should.equal(context.obj.id);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.updateInstance(context.obj, { string: 'bb' }, function(err, obj) {
      if (err) return cb(err);
      obj.string.should.equal('bb');
      obj.id.should.be.ok();
      obj.id.should.equal(context.obj.id);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.findByIdAndUpdate(context.obj.id, { string: 'cc' }, function(err, obj) {
      if (err) return cb(err);
      obj.string.should.equal('cc');
      obj.id.should.be.ok();
      obj.id.should.equal(context.obj.id);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.findOneAndUpdate({ string: 'cc' }, { string: 'dd' }, function(err, obj) {
      if (err) return cb(err);
      obj.string.should.equal('dd');
      obj.id.should.be.ok();
      obj.id.should.equal(context.obj.id);
      cb();
    });
  },
  function(cb) {
    App.models.testModel.deleteInstance(context.obj, function(err) {
      if (err) return cb(err);
      App.models.testModel.find({ }, function(err, obj) {
        if (err) return cb(err);
        obj.length.should.equal(0);
        cb();
      });
    });
  },
  function(cb) {
    App.models.testModel.findById('32', function(err) {
      if (err) return cb(err);
      //shouldn't throw error
      cb();
    });
  },
], function(err) {
  if (err) throw err;
  process.exit();
});

//we're mimicking the mongoose methods here

/*
App.models.testModel.delete({ name: 'aa'}, function(err, obj) {
  obj.name.should.equal('aa');
  called = true;
});
called.should.equal(true);
*/



/*
App.load()(App, 'sequelize');

App.models.testModel.sequelizeSchema.should.be.ok();

var schema = App.models.testModel.sequelizeSchema;
schema.string.type.key.should.equal('STRING');
schema.stringLen.type.key.should.equal('STRING');
schema.stringLen.type._length.should.equal(123);
schema.text.type.key.should.equal('TEXT');
schema.number.type.key.should.equal('REAL');
schema.integer.type.key.should.equal('INTEGER');
schema.date.type.key.should.equal('DATE');
schema.bool.type.key.should.equal('BOOLEAN');
schema.now.type.key.should.equal('DATE');
schema.now.defaultValue.key.should.equal('NOW');
schema.blob.type.key.should.equal('BLOB');
schema.enum.type.key.should.equal('ENUM');
schema.enum.type.values.length.should.equal(4);
schema.enum.type.values[0].should.equal('a');
schema.enum.type.values[1].should.equal('b');
schema.enum.type.values[2].should.equal('c');
schema.enum.type.values[3].should.equal('d');

schema.req.allowNull.should.equal(false);
schema.nreq.allowNull.should.equal(true);
schema.dreq.allowNull.should.equal(false);

schema.minmax.type.key.should.equal('REAL');
schema.minmax.validate.min.should.equal(-3);
schema.minmax.validate.max.should.equal(5.4);


*/
