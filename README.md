The database module supports mongoose and sequelize at this moment and adds a layer on top of it, to make basic operations database agnostic.
It is *not* trying to replace these ORMs or provide a full ORM agnostic API.
You can define models with only primitive types and do basic SCRUD operations.
For everything else, such as relationships, joins, mongoose arrays, you should use the ORM directly

## Usage

First, define your models.
When you define a model and you don't know what the used database will be, try to be as detailed as possible
Example:
```
App.models.user = {
 description: "A user",
 definition: {
   name: { type: 'string', required: true },
   password: { type: 'string', required: true, private: true },
   URL: { type: 'string 2083', required: false },
 }
};
```

Now do `App.load('db/convert', 'sequelize');` (or use 'mongoose'). This command takes an additional parameter,
which is a list of model names you want to convert, for example `[ "user" ]`. Leave it empty if you want to convert all models.
After that your models will have `sequelizeSchema` or `mongooseSchema` set. It won't override this object completely, only the keys that are defined in `definition`.

The last step is to call `App.load('mongoose/model')` or `App.load('sequelize/model')`.

You can now use the following helpers:
* `create(obj, cb)`
* `findById(id, cb)`,
* `findOne(where, cb)`,
* `find(where, cb)`,
* `updateInstance(instance, updateObj, [options], cb)` Set `options.readonly` and `options.private` explicitly to false if you don't want to update these attributes
* `findByIdAndUpdate(id, updateObj, [options], cb)`,
* `findOneAndUpdate(id, updateObj, [options], cb)`,
* `delete(where, cb)`,
* `deleteInstance(instance, cb)`

The callback is of the form `function(err, obj)`

## Data types
```
'string [length]',
'text',
'number',
'integer',
'date',
'boolean',
'now',
'blob',
'enum [values...]'
```

### Options
`min`, `max`, `default`, `unique`


## Notes

Sequelize is currently not tested
