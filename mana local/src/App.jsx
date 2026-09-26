import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import Splash from './components/Splash';

import Home from './pages/Home';
import Browse from './pages/Browse';
import BookingFlow from './pages/BookingFlow';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Workers from './pages/Workers';
import Jobs from './pages/Jobs';
import RealEstate from './pages/RealEstate';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminRealEstate from './pages/admin/AdminRealEstate';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminSubscriptionReports from './pages/admin/AdminSubscriptionReports';

import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerLayout from './pages/worker/WorkerLayout';
import WorkerHome from './pages/worker/WorkerHome';
import WorkerServices from './pages/worker/WorkerServices';
import WorkerSubscription from './pages/worker/WorkerSubscription';
import WorkerProfile from './pages/worker/WorkerProfile';
import WorkerSupport from './pages/worker/WorkerSupport';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isAdminOrWorker = pathname.startsWith('/admin') || pathname.startsWith('/worker');

  return (
    <>
      <Splash />
      {(!isAdminOrWorker && !isAuthPage) && <Navbar />}
      <main className={`app-main ${isAdminOrWorker ? 'admin-worker' : ''} ${isAuthPage ? 'auth-main' : ''}`}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/realestate" element={<RealEstate />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Customer */}
          <Route path="/book/:id" element={<BookingFlow />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/orders" element={
            <ProtectedRoute roles={['customer', 'admin']}>
              <Orders />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers"               element={<AdminCustomers />} />
            <Route path="workers"                 element={<AdminWorkers />} />
            <Route path="jobs"                    element={<AdminJobs />} />
            <Route path="realestate"              element={<AdminRealEstate />} />
            <Route path="categories"              element={<AdminCategories />} />
            <Route path="subscriptions"           element={<AdminSubscriptions />} />
            <Route path="subscription-reports"    element={<AdminSubscriptionReports />} />
          </Route>

          {/* Worker */}
          <Route path="/worker" element={<ProtectedRoute roles={['worker']}><WorkerLayout /></ProtectedRoute>}>
            <Route index element={<WorkerHome />} />
            <Route path="services"        element={<WorkerServices />} />
            <Route path="subscription"    element={<WorkerSubscription />} />
            <Route path="profile"         element={<WorkerProfile />} />
            <Route path="support"         element={<WorkerSupport />} />
          </Route>
        </Routes>
      </main>
      {(!isAdminOrWorker && !isAuthPage) && <BottomNav />}
    </>
  );
}

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout />
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
