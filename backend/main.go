package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

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

	router.Use(middleware.CORSMiddleware)

	api := router.PathPrefix("/api").Subrouter()

	api.HandleFunc("/auth/register", handlers.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/verify-email", handlers.VerifyEmail).Methods("GET", "OPTIONS")
	api.HandleFunc("/auth/forgot-password", handlers.ForgotPassword).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/reset-password", handlers.ResetPassword).Methods("POST", "OPTIONS")

	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/auth/me", handlers.GetCurrentUser).Methods("GET", "OPTIONS")
	protected.HandleFunc("/users/contractors", handlers.ListContractors).Methods("GET", "OPTIONS")

	protected.HandleFunc("/projects", handlers.CreateProject).Methods("POST", "OPTIONS")
	protected.HandleFunc("/projects", handlers.ListProjects).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}", handlers.GetProject).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}", handlers.UpdateProject).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/projects/{id}", handlers.DeleteProject).Methods("DELETE", "OPTIONS")
	protected.HandleFunc("/projects/{id}/assign-contractor", handlers.AssignContractor).Methods("POST", "OPTIONS")
	protected.HandleFunc("/projects/{id}/contractors", handlers.AssignContractor).Methods("POST", "OPTIONS")
	protected.HandleFunc("/projects/{id}/contractors/{contractorId}", handlers.RemoveContractor).Methods("DELETE", "OPTIONS")
	protected.HandleFunc("/projects/{id}/contractors", handlers.ListProjectContractors).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/photos", handlers.UploadProjectPhoto).Methods("POST", "OPTIONS")
	protected.HandleFunc("/projects/{id}/photos", handlers.GetProjectPhotos).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/work-logs", handlers.GetProjectWorkLogs).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/expenses", handlers.GetProjectExpenses).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/updates", handlers.CreateProjectUpdate).Methods("POST", "OPTIONS")
	protected.HandleFunc("/projects/{id}/updates", handlers.GetProjectUpdates).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/dashboard", handlers.GetProjectDashboard).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{project_id}/payments", handlers.AddPaymentSummary).Methods("POST", "OPTIONS")
	protected.HandleFunc("/projects/{project_id}/payments", handlers.ListPaymentSummaries).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/expenses/download", handlers.DownloadExpensesExcel).Methods("GET", "OPTIONS")
	protected.HandleFunc("/projects/{id}/payment-summaries/download", handlers.DownloadPaymentSummaryExcel).Methods("GET", "OPTIONS")
	protected.HandleFunc("/payments/{id}", handlers.UpdatePaymentSummary).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/payments/{id}", handlers.DeletePaymentSummary).Methods("DELETE", "OPTIONS")
	protected.HandleFunc("/payments/{id}/confirm", handlers.ConfirmPayment).Methods("POST", "OPTIONS")
	protected.HandleFunc("/payments/{id}/dispute", handlers.DisputePayment).Methods("POST", "OPTIONS")

	protected.HandleFunc("/employees", handlers.AddEmployee).Methods("POST", "OPTIONS")
	protected.HandleFunc("/employees", handlers.ListEmployees).Methods("GET", "OPTIONS")
	protected.HandleFunc("/employees/{id}", handlers.GetEmployee).Methods("GET", "OPTIONS")
	protected.HandleFunc("/employees/{id}", handlers.UpdateEmployee).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/employees/{id}", handlers.DeleteEmployee).Methods("DELETE", "OPTIONS")
	protected.HandleFunc("/employees/{id}/assign-project", handlers.AssignProject).Methods("POST", "OPTIONS")

	protected.HandleFunc("/work-logs/summary/weekly", handlers.GetWeeklySummary).Methods("GET", "OPTIONS")
	protected.HandleFunc("/work-logs/summary/by-employee", handlers.GetSummaryByEmployee).Methods("GET", "OPTIONS")
	protected.HandleFunc("/work-logs/summary/by-project", handlers.GetSummaryByProject).Methods("GET", "OPTIONS")
	protected.HandleFunc("/work-logs/check-in", handlers.CheckIn).Methods("POST", "OPTIONS")
	protected.HandleFunc("/work-logs/check-out", handlers.CheckOut).Methods("POST", "OPTIONS")
	protected.HandleFunc("/work-logs/{id}", handlers.GetWorkLogDetail).Methods("GET", "OPTIONS")
	protected.HandleFunc("/work-logs", handlers.ListWorkLogs).Methods("GET", "OPTIONS")

	protected.HandleFunc("/expenses", handlers.AddExpense).Methods("POST", "OPTIONS")
	protected.HandleFunc("/expenses/{id}", handlers.GetExpenseByID).Methods("GET", "OPTIONS")
	protected.HandleFunc("/expenses/{id}", handlers.UpdateExpense).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/expenses/{id}", handlers.DeleteExpense).Methods("DELETE", "OPTIONS")

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"Server is running"}`))
	}).Methods("GET", "OPTIONS")

	staticDir := "./ui"

	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		log.Printf("Warning: UI build directory %s does not exist. Serving API only.", staticDir)
	} else {
		fs := http.FileServer(http.Dir(staticDir))
		router.PathPrefix("/static/").Handler(http.StripPrefix("/", fs))
		router.PathPrefix("/assets/").Handler(http.StripPrefix("/", fs))

		router.HandleFunc("/manifest.json", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			http.ServeFile(w, r, filepath.Join(staticDir, "manifest.json"))
		})
		router.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, filepath.Join(staticDir, "favicon.ico"))
		})

		router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if len(r.URL.Path) > 4 && r.URL.Path[:4] == "/api" {
				w.WriteHeader(http.StatusNotFound)
				return
			}

			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
