import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CreateSpecPage from "./pages/CreateSpecPage";
import TaskBoardPage from "./pages/TaskBoardPage";
import HistoryPage from "./pages/HistoryPage";
import StatusPage from "./pages/StatusPage";
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateSpecPage />} />
          <Route path="/spec/:id" element={<TaskBoardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;