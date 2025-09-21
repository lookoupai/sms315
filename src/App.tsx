import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import Layout from "./layout";
import GuideListPage from "./pages/guide-list-page";
import AdminPage from "./pages/admin-page";
import SubmitPage from "./pages/submit-page";
import TelegramTestPage from "./pages/telegram-test";
import RecordDetailPage from "./pages/record-detail-page";
import WebsiteDetailPage from "./pages/website-detail-page";
import CountryDetailPage from "./pages/country-detail-page";
import ProjectDetailPage from "./pages/project-detail-page";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sms-guide-theme">
      <Layout>
        <Routes>
          <Route path="/" element={<GuideListPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/telegram-test" element={<TelegramTestPage />} />
          <Route path="/record/:id" element={<RecordDetailPage />} />
          <Route path="/website/:id" element={<WebsiteDetailPage />} />
          <Route path="/country/:code" element={<CountryDetailPage />} />
          <Route path="/project/:code" element={<ProjectDetailPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
