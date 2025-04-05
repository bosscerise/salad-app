/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1598921462")

  // remove field
  collection.fields.removeById("bool4116874775")

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1264587087",
    "max": 0,
    "min": 0,
    "name": "ingredients",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1598921462")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool4116874775",
    "name": "is_default",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // remove field
  collection.fields.removeById("text1264587087")

  return app.save(collection)
})
