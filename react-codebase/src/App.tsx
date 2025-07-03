import {BrowserRouter, Outlet, Route, Routes} from "react-router";
import HomeLayout from "./layout/HomeLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import OrderDetail from "./pages/OrderDetail";
import CreateOrder from "./pages/CreateOrder";
import Dashboard from "./pages/Dashboard";
import RealTimeIndicator from "./components/RealTimeIndicator";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <HomeLayout>
                <Outlet />
              </HomeLayout>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="about" element={<About />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="order-detail/:id" element={<OrderDetail />} />
          </Route>
        </Routes>
        <ToastContainer
        position="top-right"
        draggable
        pauseOnFocusLoss
        autoClose={3000}
        hideProgressBar
        newestOnTop
        pauseOnHover
      />
      <RealTimeIndicator isPolling={true} />
      </BrowserRouter>
    </>
  );
}

export default App;
