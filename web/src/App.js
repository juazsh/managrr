import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MarketingLayout from './layouts/MarketingLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import MarketingHome from './pages/marketing/Home';
import { HowItWorks, Features, Pricing, About, Contact } from './pages/marketing/PlaceholderPages';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import ProjectDashboard from './pages/ProjectDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import ContractorWorkLogs from './pages/ContractorWorkLogs';
import WorkLogDetail from './pages/WorkLogDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MarketingLayout><MarketingHome /></MarketingLayout>} />
          <Route path="/how-it-works" element={<MarketingLayout><HowItWorks /></MarketingLayout>} />
          <Route path="/features" element={<MarketingLayout><Features /></MarketingLayout>} />
          <Route path="/pricing" element={<MarketingLayout><Pricing /></MarketingLayout>} />
          <Route path="/about" element={<MarketingLayout><About /></MarketingLayout>} />
          <Route path="/contact" element={<MarketingLayout><Contact /></MarketingLayout>} />

          <Route path="/login" element={
            <div>
              <Navbar />
              <Login />
            </div>
          } />
          <Route path="/register" element={
            <div>
              <Navbar />
              <Register />
            </div>
          } />
          <Route path="/verify-email" element={
            <div>
              <Navbar />
              <VerifyEmail />
            </div>
          } />
          <Route path="/forgot-password" element={
            <div>
              <Navbar />
              <ForgotPassword />
            </div>
          } />
          <Route path="/reset-password" element={
            <div>
              <Navbar />
              <ResetPassword />
            </div>
          } />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['house_owner', 'contractor', 'employee']}>
                <div>
                  <Navbar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/new"
            element={
              <ProtectedRoute allowedRoles={['house_owner']}>
                <div>
                  <Navbar />
                  <CreateProject />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute allowedRoles={['house_owner']}>
                <div>
                  <Navbar />
                  <ProjectDetail />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id/dashboard"
            element={
              <ProtectedRoute allowedRoles={['house_owner', 'contractor', 'employee']}>
                <div>
                  <Navbar />
                  <ProjectDashboard />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contractor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['contractor']}>
                <div>
                  <Navbar />
                  <ContractorDashboard />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contractor/employees"
            element={
              <ProtectedRoute allowedRoles={['contractor']}>
                <div>
                  <Navbar />
                  <Employees />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contractor/employees/:id"
            element={
              <ProtectedRoute allowedRoles={['contractor']}>
                <div>
                  <Navbar />
                  <EmployeeDetail />
                </div>
              </ProtectedRoute>
            }
          />
         <Route
  path="/contractor/work-logs"
  element={
    <ProtectedRoute allowedRoles={['contractor']}>
      <div>
        <Navbar />
        <ContractorWorkLogs />
      </div>
    </ProtectedRoute>
  }
/>
<Route
  path="/contractor/work-logs/:id"
  element={
    <ProtectedRoute allowedRoles={['contractor']}>
      <div>
        <Navbar />
        <WorkLogDetail />
      </div>
    </ProtectedRoute>
  }
/>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;