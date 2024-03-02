import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/home";
import BleData from "./pages/bleData";

const ApplicationRoute = (): JSX.Element => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Outlet />}>
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/" element={<Outlet />}>
          <Route path="home" element={<Home />} />
          <Route path="ble-data" element={<BleData />} />
        </Route>
      </Route>
    ),
    { basename: "/" }
  );

  return <RouterProvider router={router} />;
};

export default ApplicationRoute;
