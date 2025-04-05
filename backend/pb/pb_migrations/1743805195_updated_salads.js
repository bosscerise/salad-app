/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1598921462")

  // remove field
  collection.fields.removeById("json1264587087")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1843675174",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number627390209",
    "max": null,
    "min": null,
    "name": "calories",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select105650625",
    "maxSelect": 1,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "featured",
      "seasonal",
      "protein",
      "vegan",
      "light",
      "signature"
    ]
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1874629670",
    "maxSelect": 5,
    "name": "tags",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "vegetarian",
      "vegan",
      "gluten-free",
      "high-protein",
      "light",
      "seafood",
      "mediterranean",
      "detox",
      "hearty",
      "chef-special",
      "classic",
      "popular",
      "spicy"
    ]
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number2566447538",
    "max": null,
    "min": null,
    "name": "protein",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number1385758587",
    "max": null,
    "min": null,
    "name": "carbs",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number4098050720",
    "max": null,
    "min": null,
    "name": "fats",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "bool1007901140",
    "name": "featured",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "bool4198963794",
    "name": "seasonal",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "bool2777654405",
    "name": "available",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3948282936",
    "max": 0,
    "min": 0,
    "name": "story",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number3739234390",
    "max": null,
    "min": null,
    "name": "prep_time",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text362565709",
    "max": 0,
    "min": 0,
    "name": "serving_size",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "number4101605491",
    "max": null,
    "min": null,
    "name": "display_order",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1598921462")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json1264587087",
    "maxSize": 0,
    "name": "ingredients",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("text1843675174")

  // remove field
  collection.fields.removeById("number627390209")

  // remove field
  collection.fields.removeById("select105650625")

  // remove field
  collection.fields.removeById("select1874629670")

  // remove field
  collection.fields.removeById("number2566447538")

  // remove field
  collection.fields.removeById("number1385758587")

  // remove field
  collection.fields.removeById("number4098050720")

  // remove field
  collection.fields.removeById("bool1007901140")

  // remove field
  collection.fields.removeById("bool4198963794")

  // remove field
  collection.fields.removeById("bool2777654405")

  // remove field
  collection.fields.removeById("text3948282936")

  // remove field
  collection.fields.removeById("number3739234390")

  // remove field
  collection.fields.removeById("text362565709")

  // remove field
  collection.fields.removeById("number4101605491")

  return app.save(collection)
})
