import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DocumentViewer from "./pages/DocumentViewer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicSign from "./pages/PublicSign";
e
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sign/:token" element={<PublicSign />}/>
        <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>}/>

        <Route path="/document/:id" element={
            <ProtectedRoute>
              <DocumentViewer />
            </ProtectedRoute>
          }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;