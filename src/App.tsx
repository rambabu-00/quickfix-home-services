import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import ProvidersByCategory from "./pages/ProvidersByCategory";
import ProviderDetail from "./pages/ProviderDetail";
import BookService from "./pages/BookService";
import MyBookings from "./pages/MyBookings";
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderProfileEdit from "./pages/provider/ProfileEdit";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";
import AllBookings from "./pages/admin/AllBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryName" element={<ProvidersByCategory />} />
            <Route path="/provider/:providerId" element={<ProviderDetail />} />
            <Route path="/book/:providerId" element={<ProtectedRoute allowedRoles={["customer"]}><BookService /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["customer"]}><MyBookings /></ProtectedRoute>} />
            <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={["service_provider"]}><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={["service_provider"]}><ProviderProfileEdit /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><ManageCategories /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={["admin"]}><AllBookings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
