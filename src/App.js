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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
// import TableFormRendering from "./features/Table/TableFormRendering";
// import CreateGrid from "./features/Table/CreateGrid";
// import TableCsvUpload from "./features/Table/TableCsvUpload";
import {LayoutPublic, LayoutPrivate} from "./layouts/Layouts"
import Dashboard from "./pages/Dashboard";
import { LandingPage } from "./pages/LandingPage";
// import MyCalendar from "./features/Calendar/Calender";
import DefaultLayout from "./console/DefaultLayout";

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
    <>
      <UserAuthContextProvider>
        <Routes>
          <Route element={<LayoutPublic />}>
              <Route path="/"  element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
          </Route>
          <Route element={<LayoutPrivate />}>
            <Route path="/user/*" element={<DefaultLayout />} />
              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              {/* <Route path="/calendar" element={<MyCalendar />} /> */}
              {/* <Route path="/edit-profile" element={<EditProfilePage />} /> */}
              {/* <Route path="*" element={<NotFound />} /> */}
              {/* <Route path="/tablecsvupload" element={<TableCsvUpload />} /> */}
          </Route>

          



        </Routes>
      </UserAuthContextProvider>
    </>
  );

  /* <TestSet /> */
}

export default App;
