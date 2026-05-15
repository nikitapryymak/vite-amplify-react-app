import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useStatus } from "./hooks/useStatus";
import { NavBar } from "./components/NavBar";
import { MaintenancePage } from "./components/MaintenancePage";
import { UpdateBanner } from "./components/UpdateBanner";
import { TodoPage } from "./pages/TodoPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  const { maintenance, isOutdated } = useStatus();

  if (maintenance) {
    return <MaintenancePage />;
  }

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<TodoPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <code className="flex justify-center">
        envionment: test
        <br />
        maintenance: {maintenance.toString()}
        <br />
        version: {isOutdated ? "outdated ❌" : "up-to-date ✅"}
      </code>
      {isOutdated && <UpdateBanner />}
    </BrowserRouter>
  );
}

export default App;
