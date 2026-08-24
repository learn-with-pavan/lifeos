import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import Notifications from "./pages/Notifications";
import Maintenance from "./pages/Maintenance";
import Documents from "./pages/Documents";
import ServiceHistory from "./pages/ServiceHistory";
import Homes from "./pages/Homes";
import HomeDetails from "./pages/HomeDetails";
import Insights from "./pages/Insights";
import ServiceProviders from "./pages/ServiceProviders";
import RequestService from "./pages/RequestService";
import MyServiceRequests from "./pages/MyServiceRequests";
import ServiceRequestDetails from "./pages/ServiceRequestDetails";

import ProviderLayout from "./layouts/provider/ProviderLayout";
import ProviderRequests from "./pages/provider/ProviderRequests";
import ProviderRequestDetails from "./pages/provider/ProviderRequestDetails";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderSchedule from "./pages/provider/ProviderSchedule";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderSettings from "./pages/provider/ProviderSettings";
import ProviderRegister from "./pages/provider/ProviderRegister";


function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/provider/register"
            element={<ProviderRegister />}
          />

          {/* ============================== */}
          {/* CUSTOMER APPLICATION */}
          {/* ============================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["CUSTOMER"]}
              >
                <NotificationProvider>
                  <AppLayout />
                </NotificationProvider>
              </ProtectedRoute>
            }
          >

            <Route
              path="/homes"
              element={<Homes />}
            />

            <Route
              path="/homes/:id"
              element={<HomeDetails />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/assets"
              element={<Assets />}
            />

            <Route
              path="/assets/:id"
              element={<AssetDetails />}
            />

            <Route
              path="/assets/:assetId/service"
              element={<ServiceProviders />}
            />

            <Route
              path="/service-providers/:assetId/request"
              element={<RequestService />}
            />

            <Route
              path="/maintenance"
              element={<Maintenance />}
            />

            <Route
              path="/documents"
              element={<Documents />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/service-history"
              element={<ServiceHistory />}
            />

            <Route
              path="/service-requests"
              element={<MyServiceRequests />}
            />

            <Route
              path="/service-requests/:requestId"
              element={<ServiceRequestDetails />}
            />

            <Route
              path="/insights"
              element={<Insights />}
            />

          </Route>


          {/* PROVIDER ROUTES */}

          <Route
            path="/provider"
            element={
              <ProtectedRoute>
                <ProviderLayout />
              </ProtectedRoute>
            }
          >

            <Route
              index
              element={
                <Navigate
                  to="/provider/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={
                <ProviderDashboard />
              }
            />

            <Route
              path="requests"
              element={
                <ProviderRequests />
              }
            />

            <Route
              path="requests/:requestId"
              element={
                <ProviderRequestDetails />
              }
            />

            <Route
              path="schedule"
              element={
                <ProviderSchedule />
              }
            />

            <Route
              path="/provider/profile"
              element={<ProviderProfile />}
            />

            <Route
              path="/provider/services"
              element={
                <ProviderServices />
              }
            />

            <Route
              path="/provider/settings"
              element={<ProviderSettings />}
            />

          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;