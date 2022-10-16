import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter  } from "react-router-dom";
import {
  // isMobile,
  isAndroid,
  isIOS,
} from "react-device-detect";
import "bootstrap/dist/css/bootstrap.min.css";
import './Markting/assets/css/style.css'
import Home from "./Home"
import LoginForm from "./Auth/LoginForm";
import RegisterForm from "./Auth/RegisterForm";
import TableFormRendering from "./Table/TableFormRendering";
import CreateGrid from "./Table/CreateGrid";
import TableCsvUpload from "./Table/TableCsvUpload";
import ForgotPassword from "./Auth/ForgotPassword";
import { Footer } from "./Skeleton/Footer";
import {Header} from './Skeleton/Header'
// import EditProfilePage from "./Auth/EditProfilePage";


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
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* <Route path="/edit-profile" element={<EditProfilePage />} /> */}
          <Route path="/tablecsvupload" element={<TableCsvUpload />}>
            <Route path=":formId" element={<TableCsvUpload />} />
          </Route>
          <Route path="/spreadsheet" element={<CreateGrid />} />
          <Route path="/tables">
            <Route path=":formId" element={<TableFormRendering />}>
              {/* <Route path=":action" element={<Tables />}></Route> */}
            </Route>
          </Route>
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
    // </Container>
  );

  /* <TestSet /> */
}

export default App;
