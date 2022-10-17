import {Header} from "../layouts/Header"
import {LandingPage} from "../layouts/LandingPage"
import { Footer } from "../layouts/Footer";
import { useUserAuth } from "../context/UserAuthContext";
import Dashboard from "../layouts/Dashboard";

const Home = () => {
  const { user } = useUserAuth();

  return (
    <>
      <Header />

      {
        user ? <Dashboard /> : <LandingPage />
      }
       
       <Footer />
    </>
  );
};
export default Home;
