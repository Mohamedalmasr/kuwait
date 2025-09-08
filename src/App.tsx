import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
//pages web
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import MainComponent from "./pages/MainComponent";
import Home from "./pages/Home";
import Satellite from "./pages/satellite";
import Plumbing from "./pages/plumbing";
import Plumber from "./pages/plumber";
import Maintenance from "./pages/maintenance";
import Drainage from "./pages/drainage";
import Installation from "./pages/installation";
import Contact from "./pages/Contact";
import ServiceDetails from "./pages/ServiceDetails";
import NotFound from "./pages/NotFound";

//admin pages
import AdminLogin from "./pages/Admin/admin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MessagesPage from "./pages/Admin/MessagesPage";
import MessageDetail from "./pages/Admin/MessageDetail";
import SettingsPage from "./pages/Admin/SettingsPage";
import AuthLayout from "./AuthLayout";
import "./App.css";

const Layout = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <MainComponent />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/services/satellite",
        element: <Satellite />,
      },
      {
        path: "/services/plumbing",
        element: <Plumbing />,
      },
      {
        path: "/services/plumber",
        element: <Plumber />,
      },
      {
        path: "/services/maintenance",
        element: <Maintenance />,
      },
      {
        path: "/services/drainage",
        element: <Drainage />,
      },
      {
        path: "/services/installation",
        element: <Installation />,
      },
      {
        path: "/services/:slug",
        element: <ServiceDetails />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },

  { path: "/admin/login", element: <AdminLogin /> },

  {
    path: "/admin",
    element: <AuthLayout />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "/admin/messages/:id", element: <MessageDetail /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);


function App() {
  return <RouterProvider router={router} />;
}

export default App;
