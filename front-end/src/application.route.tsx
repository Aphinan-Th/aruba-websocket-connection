import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import YourComponent from "./pages/connector";
import BleDataPage from "./pages/ble-data";
import TelemetryWebsocketPage from "./pages/telemetry-websocket";

const ApplicationRoute = (): JSX.Element => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Outlet />}>
        <Route path="/" element={<Navigate to="/telemetry-websocket" replace />} />
        <Route path="*" element={<Navigate to="/telemetry-websocket" replace />} />
        <Route path="" element={<Outlet />}>
          <Route path="telemetry-websocket" element={<TelemetryWebsocketPage />} />
          <Route path="ble-data" element={<BleDataPage />} />
          <Route path="connector" element={<YourComponent />} />
        </Route>
      </Route>
    ),
    { basename: "/" }
  );

  return <RouterProvider router={router} />;
};

export default ApplicationRoute;
