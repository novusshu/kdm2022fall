import React, { useEffect } from "react";
import { Routes, Route} from "react-router-dom";
import {
  // isMobile,
  isAndroid,
  isIOS,
} from "react-device-detect";
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/css/style.css'
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Home from "./pages/Home"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
// import TableFormRendering from "./features/Table/TableFormRendering";
// import CreateGrid from "./features/Table/CreateGrid";
// import TableCsvUpload from "./features/Table/TableCsvUpload";


function App() {
  useEffect(() => {
    if (isAndroid) {
      const url = "";
      window.location.replace(url);
    } else if (isIOS) {
      setTimeout(() => {
        window.location.replace("");
      }, 10000);
    } else {
      // window.location.replace("http:localhost:3000");
    }
  }, []);

  return (
    // <Container className="shadow p-3 mb-5 bg-white rounded">
    <>
      <UserAuthContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          {/* <Route path="/edit-profile" element={<EditProfilePage />} /> */}
          

        </Routes>
      </UserAuthContextProvider>
    </>
    // </Container>
  );

  /* <TestSet /> */
}

export default App;
