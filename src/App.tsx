import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import Layout from "./layout";
import GuideListPage from "./pages/guide-list-page";
import AdminPage from "./pages/admin-page";
import SubmitPage from "./pages/submit-page";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sms-guide-theme">
      <Layout>
        <Routes>
          <Route path="/" element={<GuideListPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
