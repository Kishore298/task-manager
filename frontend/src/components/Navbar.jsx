import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-lg">
      <Link to="/tasks" className="text-2xl font-bold">
        Task Manager
      </Link>
      <div className="flex items-center space-x-6">
        <span>Welcome, {user?.name || "Guest"}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 py-1 px-3 rounded transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
