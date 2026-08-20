import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/homes" element={<Homes />} />
          <Route path="/homes/:id" element={<HomeDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/:id" element={<AssetDetails />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/insights" element={<Insights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;