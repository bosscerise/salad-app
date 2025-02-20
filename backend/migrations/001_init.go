package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models/schema"
)

func init() {
	_ = core.RegisterMigration([]string{"0.0.0", "999.999.999"}, func(db *core.DB) error {
		// Users collection
		if err := db.Collection("users").Create(&schema.Schema{
			Fields: map[string]*schema.Field{
				"email":    schema.NewField(schema.FieldTypeEmail, "email"),
				"password": schema.NewField(schema.FieldTypePassword, "password"),
				"name":     schema.NewField(schema.FieldTypeText, "name"),
				"address":  schema.NewField(schema.FieldTypeText, "address"),
				"points":   schema.NewField(schema.FieldTypeNumber, "points").Default(0),
				"role": schema.NewField(schema.FieldTypeSelect, "role").
					Options([]string{"customer", "admin"}).
					Default("customer"),
			},
			Indexes: []string{"email"},
		}); err != nil {
			return err
		}

		// Salads collection
		if err := db.Collection("salads").Create(&schema.Schema{
			Fields: map[string]*schema.Field{
				"name":        schema.NewField(schema.FieldTypeText, "name"),
				"price":       schema.NewField(schema.FieldTypeNumber, "price"),
				"ingredients": schema.NewField(schema.FieldTypeJSON, "ingredients"),
				"image": schema.NewField(schema.FieldTypeFile, "image").
					MaxFileSize(1024 * 1024),
				"is_default": schema.NewField(schema.FieldTypeBoolean, "is_default").
					Default(true),
			},
		}); err != nil {
			return err
		}

		// Custom options collection
		if err := db.Collection("custom_options").Create(&schema.Schema{
			Fields: map[string]*schema.Field{
				"category": schema.NewField(schema.FieldTypeSelect, "category").
					Options([]string{"base", "topping", "dressing"}),
				"name": schema.NewField(schema.FieldTypeText, "name"),
				"price": schema.NewField(schema.FieldTypeNumber, "price").
					Default(0),
				"available": schema.NewField(schema.FieldTypeBoolean, "available").
					Default(true),
			},
		}); err != nil {
			return err
		}

		// Orders collection
		if err := db.Collection("orders").Create(&schema.Schema{
			Fields: map[string]*schema.Field{
				"user_id": schema.NewField(schema.FieldTypeRelation, "user_id", "users"),
				"items":   schema.NewField(schema.FieldTypeJSON, "items"),
				"total":   schema.NewField(schema.FieldTypeNumber, "total"),
				"status": schema.NewField(schema.FieldTypeSelect, "status").
					Options([]string{"pending", "prepping", "ready", "delivered"}).
					Default("pending"),
				"delivery": schema.NewField(schema.FieldTypeBoolean, "delivery"),
				"created": schema.NewField(schema.FieldTypeDate, "created").
					Auto(true),
			},
		}); err != nil {
			return err
		}

		// Subscriptions collection
		if err := db.Collection("subscriptions").Create(&schema.Schema{
			Fields: map[string]*schema.Field{
				"user_id": schema.NewField(schema.FieldTypeRelation, "user_id", "users"),
				"plan": schema.NewField(schema.FieldTypeSelect, "plan").
					Options([]string{"weekly", "monthly"}),
				"salads_per_week": schema.NewField(schema.FieldTypeNumber, "salads_per_week"),
				"active": schema.NewField(schema.FieldTypeBoolean, "active").
					Default(true),
				"next_delivery": schema.NewField(schema.FieldTypeDate, "next_delivery"),
			},
		}); err != nil {
			return err
		}

		return nil
	})
}
