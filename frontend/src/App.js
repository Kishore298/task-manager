import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskList from "./pages/TaskList";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = localStorage.getItem("token");

    if (storedUserInfo && token) {
      setUser(storedUserInfo);
    }
  }, []);

  const PrivateRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} setUser={setUser} />}
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} /> 
          <Route path="/tasks" element={<PrivateRoute element={<TaskList />} />} />
          <Route path="*" element={<Navigate to={user ? "/tasks" : "/login"} />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;



