package main

import (
	"context"
	"log"
	"net/http"

	"github.com/labstack/echo/v3.3.10+incompatible"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// MyCustomPlugin is a struct that implements the pocketbase.Plugin interface.
type MyCustomPlugin struct{}
// OnBeforeServe is called before the PocketBase server starts serving requests.
func (p *MyCustomPlugin) OnBeforeServe(ctx context.Context, app *pocketbase.PocketBase) error {
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/my-custom-route", func(c echo.Context) error {
			return c.String(http.StatusOK, "Hello, World! from my custom Go plugin")
		})
		return nil
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/get-records", func(c echo.Context) error {
			recordAPI := apis.NewRecordAPI(app)
			records, err := recordAPI.Find(c.Request().Context(), "collections", nil, nil)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}
			// Handle records...
			return nil
		})
		return nil
	})
	})

	return nil
}

// Setup is called after the PocketBase app is initialized.
func (p *MyCustomPlugin) Setup(ctx context.Context, app *pocketbase.PocketBase) error {
	app.OnBeforeAppReady(func(ctx core.Context) {
		db := ctx.Database()
		// Do something with the database here...
	})

	return nil
}

func main() {
	app := pocketbase.New()

	// Register our custom plugin
	app.OnBeforeInit(func(ctx context.Context, app *pocketbase.PocketBase) error {
		app.RegisterPlugin(&MyCustomPlugin{})
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
