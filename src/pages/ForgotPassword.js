import React, {useEffect} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Input } from "../components/Input";

const ForgotPassword = () => {
  const { resetPass, user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(user) {
      navigate("/")
    }
  }, [])

  const methods = useForm();
  const { handleSubmit } = methods;

  const handleLogin = (data) => {
    //   alert(`${data.email}`)
    if (data.email !== 0) {
      resetPass(data.email)
        .then(() => {
          console.log("Email Sent!", data.email);
          alert("Reset link has been sent to your email");
          navigate("/login");
        })
        .catch((error) => {
          // console.log(error.message)
          // if (error.message == )
          alert("Email you entered does not exists");
        });
    }

    // signInWithEmailAndPassword(auth, data.email, data.password)
    //   .then((userCredential) => {
    //     // Signed in
    //     setUser(userCredential.user);
    //     // ...
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     alert(errorMessage);
    //   });
  };

  return (
    <div className="container">
      <hr />
      <div className="card m-3 mx-auto col-lg-8">
        <h5 className="card-header text-center">Password Reset</h5>
        <div className="card-body">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="form-row">
                <Input
                  name="email"
                  label="Email"
                  className="form-group col-12 mb-3"
                />
              </div>
              <div className="form-row m-3 d-flex justify-content-center">
                <div className="form-group">
                  <button
                    type="submit"
                    onClick={() => handleLogin()}
                    className="btn btn-secondary"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
