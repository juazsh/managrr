package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/handlers"
	"github.com/juazsh/managrr/internal/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := database.Init(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.Close()

	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()

	api.HandleFunc("/auth/register", handlers.Register).Methods("POST")
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST")
	api.HandleFunc("/auth/verify-email", handlers.VerifyEmail).Methods("GET")
	api.HandleFunc("/auth/forgot-password", handlers.ForgotPassword).Methods("POST")
	api.HandleFunc("/auth/reset-password", handlers.ResetPassword).Methods("POST")

	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("/auth/me", handlers.GetCurrentUser).Methods("GET")
	protected.HandleFunc("/projects", handlers.CreateProject).Methods("POST")
	protected.HandleFunc("/projects", handlers.ListProjects).Methods("GET")
	protected.HandleFunc("/projects/{id}", handlers.GetProject).Methods("GET")
	protected.HandleFunc("/projects/{id}", handlers.UpdateProject).Methods("PUT")
	protected.HandleFunc("/projects/{id}", handlers.DeleteProject).Methods("DELETE")
	protected.HandleFunc("/projects/{id}/assign-contractor", handlers.AssignContractor).Methods("POST")
	protected.HandleFunc("/projects/{id}/photos", handlers.UploadProjectPhoto).Methods("POST")
	protected.HandleFunc("/projects/{id}/photos", handlers.GetProjectPhotos).Methods("GET")
	protected.HandleFunc("/employees", handlers.AddEmployee).Methods("POST")
	protected.HandleFunc("/employees", handlers.ListEmployees).Methods("GET")
	protected.HandleFunc("/employees/{id}", handlers.GetEmployee).Methods("GET")
	protected.HandleFunc("/employees/{id}", handlers.UpdateEmployee).Methods("PUT")
	protected.HandleFunc("/employees/{id}", handlers.DeleteEmployee).Methods("DELETE")
	protected.HandleFunc("/employees/{id}/assign-project", handlers.AssignProject).Methods("POST")
	protected.HandleFunc("/work-logs/check-in", handlers.CheckIn).Methods("POST")
	protected.HandleFunc("/work-logs/check-out", handlers.CheckOut).Methods("POST")
	protected.HandleFunc("/work-logs", handlers.ListWorkLogs).Methods("GET")
	protected.HandleFunc("/projects/{id}/work-logs", handlers.GetProjectWorkLogs).Methods("GET")
	protected.HandleFunc("/expenses", handlers.AddExpense).Methods("POST")
	protected.HandleFunc("/projects/{id}/expenses", handlers.GetProjectExpenses).Methods("GET")
	protected.HandleFunc("/expenses/{id}", handlers.GetExpenseByID).Methods("GET")
	protected.HandleFunc("/expenses/{id}", handlers.UpdateExpense).Methods("PUT")
	protected.HandleFunc("/expenses/{id}", handlers.DeleteExpense).Methods("DELETE")
	protected.HandleFunc("/projects/{id}/updates", handlers.CreateProjectUpdate).Methods("POST")
	protected.HandleFunc("/projects/{id}/updates", handlers.GetProjectUpdates).Methods("GET")

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"Server is running"}`))
	}).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
