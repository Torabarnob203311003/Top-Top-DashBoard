import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Organizers from "./components/Organizers";
import Tournaments from "./components/Tournaments";
import UserManagement from "./components/UserManagement";
import Payments from "./components/Payments";
import Insights from "./components/Insights";
import Settings from "./components/Settings";
import Login from "./components/Login";
import AdMinPrivate from "./private/Admin";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes outside layout */}
        <Route path="/login" element={<Login />} />
        {/* Routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<AdMinPrivate><Dashboard /></AdMinPrivate>} />
          <Route path="products" element={<AdMinPrivate><Products /></AdMinPrivate>} />
          <Route path="organizers" element={<AdMinPrivate><Organizers /></AdMinPrivate>} />
          <Route path="tournaments" element={<AdMinPrivate><Tournaments /></AdMinPrivate>} />
          <Route path="user-management" element={<AdMinPrivate><UserManagement /></AdMinPrivate>} />
          <Route path="payments" element={<AdMinPrivate><Payments /></AdMinPrivate>} />
          <Route path="insights" element={<AdMinPrivate><Insights /></AdMinPrivate>} />
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
