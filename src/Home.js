import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "./Skeleton/Header";
import {LandingPage} from "./Markting/LandingPage"
import { Footer } from "./Skeleton/Footer";
import DashboardAdmin from "./Account/DashboardAdmin"

const Home = ({user}) => {
  return (
    <>
      {user ? <DashboardAdmin user={user} /> : <LandingPage />}
    </>
  );
};
export default Home;
