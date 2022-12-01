import { useForm, FormProvider} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import {
  doc,
  setDoc,
} from "firebase/firestore";
import { useNavigate} from "react-router-dom";
import { Input } from "../components/Input";
import { db } from "../firebasedb";
import { useUserAuth } from "../context/UserAuthContext";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  password: Yup.string()
    .required("Required")
    // .min(8, "Password is too short - should be 8 chars minimum.")
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one lowercase, one uppercase, one number and one special case character"
    ),
  // atype: Yup.string().typeError("Please enter your account type!"),
  email: Yup.string().required("Required").email("Email is invalid"),
  // institution: Yup.string().required("Institution Required"),
});

const Signup = () => {
  const { signUp} = useUserAuth();
  const navigate = useNavigate();

  const formOptions = { resolver: yupResolver(validationSchema) };
  const methods = useForm(formOptions);
  const {
    handleSubmit,
    reset,
    // formState: { errors },
  } = methods;
  const SignupSubmit = async (data, e) => {
    console.log(data);
    try {
      const userCredential = await signUp(data.email, data.password);
      console.log("User successfully created and signed in!");
        console.log(userCredential);
      data.userID = userCredential.user.uid;
      navigate("/dashboard");
      await writeToFirebase(data);
    } catch (err) {
      console.log(err.message);
    }
  }
  const writeToFirebase = async (data) => {
    setDoc(doc(db, "Users", data.userID), {
      ...data,
    }).then(() => {});
  }

  return (
    <>
    <div className="container mt-5">
      {/* <hr /> */}
      {/* <div className="row d-flex justify-content-center align-items-center h-100"> */}
        {/* <div className="card m-3 border-light"> */}
        <div className="card m-5 mx-auto col-lg-8">
          <div className="card-header">
            <Link className="float-end btn btn-outline-primary m-2" to="/login">
              Log in
            </Link>
            <h4 className="card-title m-2">Sign up</h4>
          </div>
          <div className="card-body m-4">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(SignupSubmit)}>
                <div className="row">
                  <Input
                    name="firstName"
                    label="First Name"
                    className="mb-3 col-xl-6"
                    required={true}
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    className="mb-3 col-xl-6"
                    required={true}
                  />
                </div>
                <div className="row">
                  <Input
                    name="email"
                    label="Email"
                    className="mb-3 col-12"
                    required={true}
                  />
                </div>
                <div className="row">
                  <Input
                    name="password"
                    label="Password"
                    className="mb-3 col-12"
                    type="password"
                    required={true}
                  />
                </div>
                <div className="row d-flex justify-content-center mb-3">
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary mr-1">
                      Sign Up
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
                <small className="text-muted">
                  By clicking the 'Sign Up' button, you confirm that you accept
                  our Terms of use and Privacy Policy.
                </small>
              </form>
            </FormProvider>
          </div>
          <div className="border-top card-body text-center">
            Have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      {/* </div> */}
    </div>
     </>
  );
};

export default Signup;
