package main

import (
	"encoding/json"
	"github.com/pocketbase/pocketbase"
	"log"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// GET /menu: Fetch salads and custom options
		e.Router.GET("/api/menu", func(w http.ResponseWriter, r *http.Request) {
			salads, err := app.Dao().FindRecordsByExpr("salads")
			if err != nil {
				http.Error(w, "Failed to fetch salads: "+err.Error(), http.StatusInternalServerError)
				return
			}

			options, err := app.Dao().FindRecordsByExpr("custom_options")
			if err != nil {
				http.Error(w, "Failed to fetch options: "+err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"salads":  salads,
				"options": options,
			})
		})

		// POST /order: Submit an order (authenticated users only)
		e.Router.POST("/api/order", func(w http.ResponseWriter, r *http.Request) {
			record, err := core.AuthRecordFromContext(r.Context())
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			var orderData struct {
				SaladID  string                 `json:"salad_id"`
				Custom   map[string]interface{} `json:"custom"`
				Delivery bool                   `json:"delivery"`
			}
			if err := json.NewDecoder(r.Body).Decode(&orderData); err != nil {
				http.Error(w, "Invalid order data", http.StatusBadRequest)
				return
			}

			collection, err := app.Dao().FindCollectionByNameOrId("orders")
			if err != nil {
				http.Error(w, "Failed to find orders collection", http.StatusInternalServerError)
				return
			}

			newOrder := models.NewRecord(collection)
			newOrder.Set("user", record.Id)
			newOrder.Set("items", orderData)
			newOrder.Set("status", "pending")
			newOrder.Set("delivery", orderData.Delivery)

			if err := app.Dao().SaveRecord(newOrder); err != nil {
				http.Error(w, "Failed to save order", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"message":  "Order placed",
				"order_id": newOrder.Id,
			})
		})

		// POST /subscriptions: Create a subscription
		e.Router.POST("/api/subscriptions", func(w http.ResponseWriter, r *http.Request) {
			record, err := core.AuthRecordFromContext(r.Context())
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			var subData struct {
				Plan           string `json:"plan"`
				SaladsPerCycle int    `json:"salads_per_cycle"`
			}
			if err := json.NewDecoder(r.Body).Decode(&subData); err != nil {
				http.Error(w, "Invalid subscription data", http.StatusBadRequest)
				return
			}

			collection, err := app.Dao().FindCollectionByNameOrId("subscriptions")
			if err != nil {
				http.Error(w, "Failed to find subscriptions collection", http.StatusInternalServerError)
				return
			}

			newSub := models.NewRecord(collection)
			newSub.Set("user", record.Id)
			newSub.Set("plan", subData.Plan)
			newSub.Set("salads_per_cycle", subData.SaladsPerCycle)
			newSub.Set("active", true)
			newSub.Set("next_delivery", time.Now().AddDate(0, 0, 7))

			if err := app.Dao().SaveRecord(newSub); err != nil {
				http.Error(w, "Failed to save subscription", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"message": "Subscription created",
				"sub_id":  newSub.Id,
			})
		})

		// GET /loyalty: Check loyalty points
		e.Router.GET("/api/loyalty", func(w http.ResponseWriter, r *http.Request) {
			record, err := core.AuthRecordFromContext(r.Context())
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"points":       record.GetInt("points"),
				"salad_streak": record.GetInt("salad_streak"),
			})
		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
