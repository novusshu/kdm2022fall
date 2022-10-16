import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { AuthComponent } from "../Skeleton/AuthComponent";
import { Header } from "../Skeleton/Header";
import { Footer } from "../Skeleton/Footer";

import { Input } from "../Components";

const LoginForm = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();
  console.log(auth)

  const methods = useForm();
  const { handleSubmit, reset } = methods;

  const handleLogin = (data) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        setUser(userCredential.user);
        navigate('/')
        // ...
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };

  console.log(user)

  // AuthComponent(
  //   {
  //     user,
  //     setUser,
  //     auth
  //   })

  return (
    <>
    <div className="container">
      <hr />
      <div className="card m-3 mx-auto col-lg-8">
        <h5 className="card-header text-center">Log In</h5>
        <div className="card-body">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleLogin)}>
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

          <div className="forgot-password text-right">
            Forget <Link to="/forgotpassword">password?</Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginForm;
