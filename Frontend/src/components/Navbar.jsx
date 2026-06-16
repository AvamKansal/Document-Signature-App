import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 shadow">
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        E-Sign Platform
      </h1>
      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Profile
        </button>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
