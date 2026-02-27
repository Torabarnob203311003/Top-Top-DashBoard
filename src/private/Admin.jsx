import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { Navigate, useLocation } from "react-router-dom";

const AdMinPrivate = ({ children }) => {
     const location = useLocation();
     const token = localStorage.getItem("accessToken");


     if (!token) {
          return <Navigate state={location.pathname} to="/login" replace />;
     }

     let decoded;
     try {
          decoded = jwtDecode(token);
     } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("accessToken");
          return <Navigate state={location.pathname} to="/login" replace />;
     }


     const currentTime = Date.now() / 1000;
     if (decoded.exp && decoded.exp < currentTime) {
          toast.error("Token expired , please mam login again")

          localStorage.removeItem("accessToken");
          return <Navigate state={location.pathname} to="/login" replace />;
     }


    
     if (decoded?.email && decoded.role === "admin") {
          return children;
     } else {
          toast.error("Only Admin login required")
          return <Navigate state={location.pathname} to="/login" replace />;
     }
};

export default AdMinPrivate;