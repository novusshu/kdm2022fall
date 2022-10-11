import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginForm from "./Forms/LoginForm";
import RegisterForm from "./Forms/RegisterForm";
import MentorForm from "./Forms/MentorForm";
import ParticipationForm from "./Forms/ParticipationForm";
import UnderstandingForm from "./Forms/UnderstandingForm";
import TranscriptForm from "./Forms/TranscriptForm";
import InstitutionForm from "./Forms/InstitutionForm";
import Home from "./Components/Home";
import DashboardStudent from "./Components/DashboardStudent";
import DashboardFaculty from "./Components/DashboardFaculty";
import DashboardAdmin from "./Components/DashboardAdmin";
import VizDash from "./Visualization/VizDash";
import EditTableau from "./Visualization/EditTableau";
import Header from "./Components/Header";
import FormRendering from "./Automatic Forms/FormRendering";
import TableFormRendering from "./Automatic Forms/TableFormRendering";
import CreateGrid from "./Table/CreateGrid";
import CSVUpload from "./Automatic Forms/CSVUpload";
import TableCsvUpload from "./Automatic Forms/TableCsvUpload";
import Forms from "./Automatic Forms/DefaultFormsPage";
import { Tables } from "./Automatic Forms/DefaultFormsPage";
import ForgotPassword from "./Forms/ForgotPassword";
import { Container } from "react-bootstrap";
import SampleTable from "./Automatic Forms/SampleTable";
import Dictaphone from "./SimpleChatbot/Dictaphone";
import {
  // isMobile,
  isAndroid,
  isIOS
} from "react-device-detect";
import { ChartRendering } from "./Automatic Charts/ChartRendering";
import DefaultCharts from "./Automatic Charts/DefaultChartPage";
import EditProfilePage from "./Forms/EditProfilePage";
import DefaultHomePage from "./Components/DefaultHomePage";
import { ReadMe } from "./Components/ReadMe";
function App() {
  useEffect(() => {
    if (isAndroid) {
      const url = "https://umkc.app.box.com/s/y2k6x53kb5o90umxnfsinu2mdr0rh0yv";

      window.location.replace(url);
    } else if (isIOS) {
      // window.location.replace("https://apps.apple.com/us/app/soar-ai/id1621354278");

      setTimeout(() => {
        window.location.replace(
          "https://apps.apple.com/us/app/soar-ai/id1621354278"
        );
      }, 10000);
    } else {
      // window.location.replace("http:localhost:3000");
    }
  }, []);

  return (
    <Container className="shadow p-3 mb-5 bg-white rounded">
      {/* {isAndroid ? (
        <div>
          If you have not been automatically redirected, click on the following
          link:
          <a href="">Open Android app</a>
        </div>
      ) : isIOS ? (
        <div>
          If you have not been automatically redirected, click on the following
          link:
          <a href="">Open iOS app</a>
        </div>
      ) : ( */}
      <>
        <Header />
        <Routes>
          <Route path="/" element={<DefaultHomePage />} />
          {/* <Route path="/home" element={<DefaultHomePage />}>
          </Route> */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/readme" element={<ReadMe />}>
            <Route path=":action" element={<ReadMe />} />
          </Route>

          <Route path="/register" element={<RegisterForm />}></Route>
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/mentorform" element={<MentorForm />} />
          <Route path="/transcriptform" element={<TranscriptForm />} />
          <Route path="/understandingform" element={<UnderstandingForm />} />
          <Route path="/participationform" element={<ParticipationForm />} />
          <Route path="/institutionform" element={<InstitutionForm />} />
          {/* <Route path="/gpa" element={<ViewGPA />} /> */}
          {/* <Route path="/sample-form" element={<FormRendering />} /> */}
          <Route path="/csvupload" element={<CSVUpload />} />
          <Route path="/tablecsvupload" element={<TableCsvUpload />}>
            <Route path=":formId" element={<TableCsvUpload />}></Route>
          </Route>
          <Route path="/viz" element={<VizDash />} />
          <Route path="/sampleTable" element={<SampleTable />} />
          <Route path="/forms" element={<Forms />}>
            <Route path=":formId" element={<FormRendering />}>
              <Route path=":action" element={<Forms />}></Route>
            </Route>
          </Route>
          <Route path="/spreadsheet" element={<CreateGrid />} />
          <Route path="/tables" element={<Tables />}>
            <Route path=":formId" element={<TableFormRendering />}>
              <Route path=":action" element={<Tables />}></Route>
            </Route>
          </Route>
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/dictaphone" element={<Dictaphone />} />
          <Route path="/charts" element={<DefaultCharts />}>
            <Route path=":formId" element={<ChartRendering />} />
          </Route>
        </Routes>
      </>
      {/* )} */}
    </Container>
  );

  /* <TestSet /> */
}

export default App;
