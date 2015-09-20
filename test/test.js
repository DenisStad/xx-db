var setup = require('../setup');
var should = require('should');

var App = {
  models: {
    testModel: {
      definition: {
        string: { type: 'string' },
        stringLen: { type: 'string 123' },
        text: { type: 'text' },
        number: { type: 'number' },
        integer: { type: 'integer' },
        date: { type: 'date' },
        bool: { type: 'boolean' },
        now: { type: 'now' },
        blob: { type: 'blob' },
        enum: { type: 'enum a b c d ' },

        req: { type: 'string', required: true },
        nreq: { type: 'string', required: false },
        dreq: { type: 'string' },

        minmax: { type: 'number', min: -3, max: 5.4 },
      }
    }
  }
};

setup(App, 'mongoose');

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


//we're mimicking the mongoose methods here
App.models.testModel.Model = {
  findById: function(id, cb) {
    cb(null, id);
  },
  findOne: function(params, cb) {
    cb(null, params);
  },
  find: function(params, cb) {
    cb(null, params);
  },
  create: function(obj, cb) {
    cb(null, obj);
  },
  /*
  update: function(params, updates, cb) {
    cb(null, { params: params, updates: updates });
  },
  */
  findOneAndUpdate: function(params, updates, cb) {
    cb(null, { params: params, updates: updates });
  },
  findByIdAndUpdate: function(id, updates, cb) {
    cb(null, { id: id, updates: updates });
  },
  remove: function(params, cb) {
    cb(null, params);
  },
};

var called = false;
App.models.testModel.findById('id123', function(err, obj) {
  obj.should.equal('id123');
  called = true;
});
called.should.equal(true);
called = false;
App.models.testModel.findOne({ name: 'aa' }, function(err, obj) {
  obj.name.should.equal('aa');
  called = true;
});
called.should.equal(true);
called = false;
App.models.testModel.find({ name: 'aa' }, function(err, obj) {
  obj.name.should.equal('aa');
  called = true;
});
called.should.equal(true);
called = false;
App.models.testModel.create({ name: 'aa' }, function(err, obj) {
  obj.name.should.equal('aa');
  called = true;
});
called.should.equal(true);
/*
called = false;
App.models.testModel.update({ name: 'aa' }, { name: 'bb' }, function(err, obj) {
  obj.params.name.should.equal('aa');
  obj.updates.$set.name.should.equal('bb');
  called = true;
});
called.should.equal(true);
*/
called = false;
App.models.testModel.findByIdAndUpdate('aa', { name: 'bb' }, function(err, obj) {
  obj.id.should.equal('aa');
  obj.updates.$set.name.should.equal('bb');
  called = true;
});
called.should.equal(true);
called = false;
App.models.testModel.findOneAndUpdate({ name: 'aa'}, { name: 'bb' }, function(err, obj) {
  obj.params.name.should.equal('aa');
  obj.updates.$set.name.should.equal('bb');
  called = true;
});
called.should.equal(true);
called = false;
App.models.testModel.delete({ name: 'aa'}, function(err, obj) {
  obj.name.should.equal('aa');
  called = true;
});
called.should.equal(true);




setup(App, 'sequelize');

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


console.log("All tests passed");
