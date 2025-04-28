migrate((db) => {
  const collection = new Collection({
    "id": "user_salads",
    "name": "user_salads",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "user_id",
        "name": "user_id",
        "type": "relation",
        "required": true,
        "presentational": false,
        "unique": false,
        "options": {
          "collectionId": "users",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "required": true,
        "presentational": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "id": "ingredients",
        "name": "ingredients",
        "type": "json",
        "required": true,
        "presentational": false,
        "unique": false,
        "options": {}
      },
      {
        "id": "total_price",
        "name": "total_price",
        "type": "number",
        "required": true,
        "presentational": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "id": "total_calories",
        "name": "total_calories",
        "type": "number",
        "required": false,
        "presentational": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "id": "total_protein",
        "name": "total_protein",
        "type": "number",
        "required": false,
        "presentational": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "id": "total_carbs",
        "name": "total_carbs",
        "type": "number",
        "required": false,
        "presentational": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "id": "total_fats",
        "name": "total_fats",
        "type": "number",
        "required": false,
        "presentational": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "id": "is_favorite",
        "name": "is_favorite",
        "type": "bool",
        "required": false,
        "presentational": false,
        "unique": false,
        "options": {}
      }
    ],
    "listRule": "@request.auth.id = user_id",
    "viewRule": "@request.auth.id = user_id",
    "createRule": "@request.auth.id = @request.data.user_id",
    "updateRule": "@request.auth.id = user_id",
    "deleteRule": "@request.auth.id = user_id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection("user_salads");
})
