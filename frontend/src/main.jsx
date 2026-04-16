import "./styles/index.css";
import "./styles/color-palette.css";

import ReactDOM from "react-dom/client";
import { ROUTES } from "./config/routes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";
import UploadVideo from "./pages/UploadVideo";
import Results from "./pages/Results";
import { AppProvider } from "./components/app/AppProvider";
import Layout from "./components/app/Layout";
import AuthLayout from "./pages/AuthLayout";
import Dashboard from "./pages/Dashboard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AppProvider>
      <Routes>
        {/* Auth */}
        <Route path={ROUTES.auth} element={<AuthLayout />} />

        {/* LandingPage */}
        <Route path={ROUTES.landingPage} element={<LandingPage />} />

        {/* Dub Video */}
        <Route
          path={ROUTES.uploadVideo}
          element={
            <Layout>
              <UploadVideo />
            </Layout>
          }
        />

        {/* Dashboard */}
        <Route
          path={ROUTES.dashboard}
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* Results */}
        <Route
          path={ROUTES.results}
          element={
            <Layout>
              <Results />
            </Layout>
          }
        />

        {/* Terms */}
        <Route
          path={ROUTES.terms}
          element={
            <Layout>
              <Terms />
            </Layout>
          }
        />

        {/* Privacy */}
        <Route
          path={ROUTES.privacy}
          element={
            <Layout>
              <Privacy />
            </Layout>
          }
        />

        {/* Cookies */}
        <Route
          path={ROUTES.cookies}
          element={
            <Layout>
              <Cookies />
            </Layout>
          }
        />
      </Routes>
    </AppProvider>
  </BrowserRouter>,
);
