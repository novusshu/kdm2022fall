import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../layouts/Header";
import { Footer } from "../layouts/Footer";
import { useUserAuth } from "../context/UserAuthContext";
import { Input } from "../components/Input";

const LoginForm = () => {
  const { logIn, user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(user) {
      navigate("/")
    }
  }, [user])

  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const loginSubmit = async (data) => {
    try {
      await logIn(data.email, data.password);
      navigate("/");
    } catch (err) {
        // const errorCode = error.code;
        const errorMessage = err.message;
        alert(errorMessage);
      };
  };

  return (
    <>
    <Header /> 
    <hr />
    <div className="container mt-5">
      <hr />
      <div className="card m-3 mx-auto col-lg-8">
        <h5 className="card-header text-center">Log In</h5>
        <div className="card-body">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(loginSubmit)}>
              <div className="form-row">
                <Input
                  name="email"
                  label="Email"
                  className="form-group col-12 mb-3"
                  required={true}
                />
              </div>
              <div className="form-row">
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  className="form-group col-12 mb-3"
                  required={true}
                />
              </div>
              <div className="form-row m-3 d-flex justify-content-center">
                <div className="form-group">
                  <button type="submit" className="btn btn-primary mr-1">
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>

          <div className="p-4 box text-center">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>

          <div className="forgot-password text-right">
            Forget <Link to="/forgotpassword">password?</Link>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default LoginForm;
