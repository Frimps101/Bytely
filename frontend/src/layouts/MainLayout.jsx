import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="w-[70%] mx-auto">
          <Navbar />
        </div>
      </div>
      <div className="w-[70%] mx-auto">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
