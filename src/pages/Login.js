import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Input } from "../components/Input";

const LoginForm = ( ) => {
  const { logIn } = useUserAuth();
  const navigate = useNavigate();

  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const loginSubmit = async (data) => {
    try {
      await logIn(data.email, data.password);
      navigate("/user");
    } catch (err) {
        // const errorCode = error.code;
        const errorMessage = err.message;
        alert(errorMessage);
      };
  };

  return (
    <>
    <div className="container mt-5 mb-5">
      {/* <hr className="m-5"/> */}
      <div className="card m-5 mx-auto col-lg-8">
      <div className="card-header">
        <h5 className="text-center card-title m-2">Log In</h5>
        </div>
        <div className="card-body m-4">
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
    </>
  );
};

export default LoginForm;
