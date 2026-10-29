import { Routes, Route, Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import Home from '../pages/Home';
import Home2 from '../pages/Home2';
import Home3 from '../pages/Home3';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Shop from '../pages/Shop';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';
import ProductDetail from '../pages/ProductDetail';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Profile from '../pages/Profile';

// Newly added eCommerce storefront pages
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import TrackOrder from '../pages/TrackOrder';
import FAQ from '../pages/FAQ';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import NotFound from '../pages/NotFound';

// Admin Layout and Pages
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminBlogs from '../pages/admin/AdminBlogs';
import AdminRecycleBin from '../pages/admin/AdminRecycleBin';
import AdminMedia from '../pages/admin/AdminMedia';
import AdminSettings from '../pages/admin/AdminSettings';
import AddProduct from '../pages/AddProduct';
import AddBlog from '../pages/AddBlog';

// Public Storefront Layout with Store Header & Footer
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Storefront Routes (Rendered with Header & Footer) */}
      <Route path='/' element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path='home-1' element={<Home />} />
        <Route path='home-2' element={<Home2 />} />
        <Route path='home-3' element={<Home3 />} />
        <Route path='cart' element={<Cart />} />
        <Route path='wishlist' element={<Wishlist />} />
        <Route path='checkout' element={<Checkout />} />
        <Route path='order-success' element={<OrderSuccess />} />
        <Route path='order-success/:id' element={<OrderSuccess />} />
        <Route path='track-order' element={<TrackOrder />} />
        <Route path='faq' element={<FAQ />} />
        <Route path='privacy-policy' element={<PrivacyPolicy />} />
        <Route path='terms-of-service' element={<TermsConditions />} />
        <Route path='about' element={<About />} />
        <Route path='contact' element={<Contact />} />
        <Route path='shop' element={<Shop />} />
        <Route path='shop-sidebar' element={<Shop />} />
        <Route path='shop-drawer' element={<Shop />} />
        <Route path='blog' element={<Blog />} />
        <Route path='blog-sidebar' element={<Blog />} />
        <Route path='blog-drawer' element={<Blog />} />
        <Route path='blog/:id' element={<BlogDetail />} />
        <Route path='product/:id' element={<ProductDetail />} />
        <Route path='signin' element={<SignIn />} />
        <Route path='signup' element={<SignUp />} />
        <Route path='profile' element={<Profile />} />
        <Route path='404' element={<NotFound />} />
        {/* Wildcard 404 Catch-All within MainLayout */}
        <Route path='*' element={<NotFound />} />
      </Route>

      {/* 2. Admin Studio Dedicated Menu Pages (Shared AdminLayout with Sidebar & Topbar) */}
      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path='dashboard' element={<AdminDashboard />} />
        <Route path='profile' element={<AdminProfile />} />
        <Route path='products' element={<AdminProducts />} />
        <Route path='categories' element={<AdminCategories />} />
        <Route path='orders' element={<AdminOrders />} />
        <Route path='customers' element={<AdminCustomers />} />
        <Route path='blogs' element={<AdminBlogs />} />
        <Route path='recycle-bin' element={<AdminRecycleBin />} />
        <Route path='media' element={<AdminMedia />} />
        <Route path='settings' element={<AdminSettings />} />
      </Route>

      {/* 3. Focused Full-Screen Editors */}
      <Route path='/admin/add-product' element={<AddProduct />} />
      <Route path='/admin/edit-product/:id' element={<AddProduct />} />
      <Route path='/admin/add-blog' element={<AddBlog />} />
      <Route path='/admin/edit-blog/:id' element={<AddBlog />} />
    </Routes>
  );
};

export default AppRoutes;
