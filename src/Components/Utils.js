import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../Firebase/firebasedb";
import {
  doc,
  setDoc,
  getDoc,
  orderBy,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { format, parse, isValid, set } from "date-fns";
import { faker } from "@faker-js/faker";
import {
  atypeOptionsCompat,
  isCampusLead,
  isHubLead,
  isStudentOrMentor,
} from "../Fixed Sources/accountTypes";
import {
  AiTwotoneUnlock,
  AiOutlineUnlock,
  AiTwotoneLock,
  AiFillQuestionCircle,
  AiFillCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineLock,
} from "react-icons/ai";
import { BsArrowCounterclockwise } from "react-icons/bs";
import ReactTooltip from "react-tooltip";
import theme from "./theme";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { useFormContext } from "react-hook-form";

export function makeid(l) {
  var text = "";
  var char_list =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < l; i++) {
    text += char_list.charAt(Math.floor(Math.random() * char_list.length));
  }
  return text;
}
export const processID = (rawID) => {
  if (rawID) return rawID.replace(/[^a-zA-Z0-9\- ]/g, "").replaceAll(" ", "-");
};
export const removeSpecialCharacters = (rawID) => {
  if (rawID) return rawID.replace(/[^a-zA-Z0-9\-\_\(\)\/ ]/g, "");
};

const DateFormats = [
  "yyyy-MM-dd",
  "yyyy-M-d",
  "yyyy/M/d",
  "yyyy M d",
  "yyyy MM d",
  "yyyy/MM/d",
  "yyyy-MM-d",
  "yyyy MM dd",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "yyyy M dd",
  "yyyy/M/dd",
  "yyyy-M-dd",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm:ss A",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd HH:mm A",
  "MMMM d yyyy",
  "M/d/yyyy",
  "M d yyyy",
  "MM d yyyy",
  "MM/d/yyyy",
  "MM-d-yyyy",
  "MMMM dd, yyyy",
  "MMMM dd, yyyy",
  "MMMM dd yyyy",
  "MMMM do, yyyy",
  "MMMM do yyyy",
  "MMM dd, yyyy",
  "MMM do, yyyy",
  "MMM d, yyyy",
  "MMM d yyyy",
  "MMMM dd yyyy",
  "MMMM do yyyy",
  "MMM dd yyyy",
  "MMM do yyyy",
  "EEEE, MMMM dd yyyy, HH:mm",
  "EEEE, MMMM dd yyyy, HH:mm A",
  "EEEE, MMMM do yyyy, HH:mm",
  // 'EEEE, MMMM do yyyy, HH:mm A',
  "EEEE MMMM dd yyyy HH:mm",
  "EEEE MMMM dd yyyy HH:mm A",
  // 'EEEE MMMM do yyyy HH:mm',
  // 'EEEE MMMM do yyyy HH:mm A',
  "EEEE, MMMM dd yyyy, HH:mm:ss",
  "EEEE, MMMM dd yyyy, HH:mm:ss A",
  // 'EEEE, MMMM do yyyy, HH:mm:ss',
  // 'EEEE, MMMM do yyyy, HH:mm:ss A',
  "EEEE MMMM dd yyyy HH:mm:ss",
  "EEEE MMMM dd yyyy HH:mm:ss A",
  // 'EEEE MMMM do yyyy HH:mm:ss',
  // 'EEEE MMMM do yyyy HH:mm:ss A',
  "MM/dd/yyyy",
  "MM dd yyyy",
  "dd MMMM yyyy",
  "do MMMM yyyy",
  "yyyy MMMM dd",
  "yyyy-MM-dd HH:mm:ss",
];
export const parseMultiple = (dateString, formatString = DateFormats) => {
  let result;
  for (let i = 0; i < formatString.length; i++) {
    result = parse(dateString, formatString[i], new Date());
    if (isValid(result)) {
      const formattedTxt = format(result, "yyyy-MM-dd");
      return formattedTxt;
    }
  }
  return null;
};
export const parseMultiple2 = (dateString, formatString = DateFormats) => {
  let result;
  for (let i = 0; i < formatString.length; i++) {
    result = parse(dateString, formatString[i], new Date());
    if (isValid(result)) {
      const formattedTxt = format(result, "MMMM dd, yyyy");
      return formattedTxt;
    }
  }
  return null;
};

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
function generateRandomNicknames(rhyme = false) {
  let nickname = "";
  if (rhyme) {
    let fName = faker.name.firstName();
    let adjective = faker.word.adjective();
    while (fName[0].toLowerCase() != adjective[0].toLowerCase()) {
      adjective = faker.word.adjective();
    }
    nickname = `${toTitleCase(adjective)} ${fName}`;
  } else {
    let fName = faker.name.firstName();
    let adjective = faker.word.adjective();
    nickname = `${toTitleCase(adjective)} ${fName}`;
  }
  return nickname;
}
export const FakeNameDropDown = ({ userData, errors, setValue }) => {
  const numberOfNames = 5;
  let initList = [];
  let initName = "";
  if (
    userData &&
    isStudentOrMentor(userData.atype) &&
    userData.nickname &&
    userData.nickname != ""
  ) {
    initList.push(userData.nickname);
    initName = userData.nickname;
  }
  // const { watch,
  //     register,
  //     formState: { errors }
  // } = useFormContext();
  // console.log('userData', userData)
  // console.log('initList', initList)
  const [nicknameList, setNicknameList] = useState([...initList]);
  const [takenNames, setTakenNames] = useState([]);
  const [refreshClick, setRefreshClick] = useState(0);

  // console.log('atype', atype)

  useEffect(() => {
    const q = query(collection(db, "Users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allNicknamesServer = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.nickname && data.nickname != "")
          allNicknamesServer.push(data.nickname);
      });
      console.log("Current taken names: ", allNicknamesServer);
      const newNameList = [...Array(numberOfNames)].map((item, i) => {
        let taken = true;
        let nickname = "";
        while (taken) {
          nickname = generateRandomNicknames(false);
          if (!allNicknamesServer.includes(nickname)) {
            taken = false;
          }
        }

        return nickname;
      });
      const newNameListRhyme = [...Array(numberOfNames)].map((item, i) => {
        let taken = true;
        let nickname = "";
        while (taken) {
          nickname = generateRandomNicknames(true);
          if (!allNicknamesServer.includes(nickname)) {
            taken = false;
          }
        }

        return nickname;
      });
      setNicknameList([...initList, ...newNameListRhyme, ...newNameList]);
    });
  }, [refreshClick]);
  // console.log('errors', errors)
  // const { handleSubmit, reset, register, setValue, formState: { errors } } = methods;
  const CustomMenu = React.forwardRef(
    ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
      const [value, setValue] = useState("");

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <ul className="list-unstyled">
            {React.Children.toArray(children).filter(
              (child) =>
                !value ||
                child.props.children.toLowerCase().startsWith(value) ||
                child.props.children.startsWith(value)
            )}
          </ul>
        </div>
      );
    }
  );
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
      variant={
        errors["nickname"] && !currentEventKey
          ? "outline-danger"
          : "outline-theme"
      }
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
      &#x25bc;
    </Button>
  ));
  const [currentEventKey, setCurrentEventKey] = useState(initName);
  return (
    <div>
      <ReactTooltip backgroundColor={theme.highlightColor} />

      <Dropdown
        className="col-md-6 mt-2 "
        onSelect={(eventKey, event) => {
          console.log("setValue", setValue);
          setValue("nickname", eventKey);
          setCurrentEventKey(eventKey);
        }}
      >
        <Dropdown.Toggle
          id="dropdown-custom-components"
          variant="outline-theme"
        >
          Select Your Nickname: <b>{currentEventKey}</b>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <div style={{ textAlign: "center" }}>
            <Button
              className="mb-2"
              variant="outline-theme"
              size="sm"
              onClick={() => {
                setRefreshClick(refreshClick + 1);
              }}
            >
              <BsArrowCounterclockwise
                style={{
                  marginRight: "3px",
                  color: theme.highlightColor,
                  fontSize: "16px",
                }}
              />
              Refresh Names
            </Button>
          </div>
          {nicknameList.map((nName) => {
            return (
              <Dropdown.Item eventKey={nName} active={nName == currentEventKey}>
                {nName}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
        <AiOutlineLock
          style={{
            marginLeft: "2px",
            marginBottom: "3px",
            color: "green",
            fontSize: "17px",
          }}
          data-tip={`This name will be shown to other users instead.`}
        />
      </Dropdown>

      <div className="is-invalid">
        {/* <div className="invalid-feedback">hello22</div> */}
      </div>
      <div className="invalid-feedback mb-2">
        {errors["nickname"] && !currentEventKey
          ? errors["nickname"].message
          : ""}
      </div>
    </div>
  );
};
export const encryptableQuestionTypes = [
  "short_answer",
  "long_answer",
  "email",
  "phone_number",
];
export const requirableQuestionTypes = [
  "short_answer",
  "long_answer",
  "date",
  "email",
  "phone_number",
  "file_upload",
];
export const FormLibrary = ({
  setFormLibraryExternal = null,
  accountType = null,
  publishedOnly = true,
}) => {
  const [formLibrary, setFormLibrary] = useState([]);
  useEffect(() => {
    const formLibraryRef = collection(db, "form_library");
    const q = query(formLibraryRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const formLibraryServer = [];
      let foundFormToEdit = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // console.log('data', data)
        // console.log('Utils', accountType, data.allowedRoles)
        if (publishedOnly) {
          if (data.status == "published") {
            if (
              accountType &&
              data.allowedRoles &&
              data.allowedRoles.includes(accountType)
            ) {
              formLibraryServer.push(data);
            } else {
              if (accountType) {
                // console.log('accountType', accountType)
                if (isCampusLead(accountType) || isHubLead(accountType)) {
                  // console.log('qualified')

                  formLibraryServer.push(data);
                }
              }
            }
          }
        } else {
          if (
            accountType &&
            data.allowedRoles &&
            data.allowedRoles.includes(accountType)
          ) {
            formLibraryServer.push(data);
          } else {
            if (accountType) {
              // console.log('accountType', accountType)
              if (isCampusLead(accountType) || isHubLead(accountType)) {
                // console.log('qualified')

                formLibraryServer.push(data);
              }
            }
          }
        }
      });
      if (setFormLibraryExternal) {
        setFormLibraryExternal([...formLibraryServer]);
      }
      setFormLibrary([...formLibraryServer]);
    });
  }, []);
  return <></>;
};
export const formatDate = (date) => {
  if (date) {
    const createdDate = date.toDate().toDateString();
    const createdTime = date.toDate().toLocaleTimeString("en-US");
    return `${createdDate}, ${createdTime}`;
  }
  return "N/A";
};
export function getDifferenceInDays(date1, date2) {
  if (!date1) {
    date1 = new Date();
  }
  if (!date2) {
    date2 = new Date();
  }

  // To calculate the time difference of two dates
  var Difference_In_Time = date2.getTime() - date1.getTime();
  // console.log('difference', Difference_In_Time)
  // To calculate the no. of days between two dates
  var Difference_In_Days = Math.abs(
    Math.round(Difference_In_Time / (1000 * 3600 * 24))
  );
  // console.log('difference days', Difference_In_Days)

  return Difference_In_Days;
}
export const deleteFormsPermanent = async (formID, callback) => {
  if (formID) {
    await deleteDoc(doc(db, "form_library_recently_deleted", formID));
    // alert(`Form ${formID} removed permanently from database`);
    if (callback) {
      console.log("callback deleteFormsPermanent", callback);
      callback();
    }
  }
};
export const restoreForm = async (formID, userData = null, callback) => {
  if (formID) {
    let docSnapshot = await getDoc(
      doc(db, "form_library_recently_deleted", formID)
    );
    let formData = {};
    if (docSnapshot.data()) {
      formData = docSnapshot.data();
      console.log(`Form ${formID} is now moved to main dashboard!`);
      if (userData) {
        formData = {
          ...formData,
          status: "unpublished",
          restoredAt: serverTimestamp(),
          restoredBy: userData.userID,
          restoreEmail: userData.email,
        };
      } else {
        formData = {
          ...formData,
          status: "unpublished",
          restoredAt: serverTimestamp(),
        };
      }
      console.log("restored formData", formData);

      await setDoc(doc(db, "form_library", formID), formData, { merge: true });
      await deleteDoc(doc(db, "form_library_recently_deleted", formID));
    }

    callback();
  }
};
export const CustomMenu = React.forwardRef(
  ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
    const [value, setValue] = useState("");

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Form.Control
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) =>
              !value ||
              child.props.children.toLowerCase().includes(value) ||
              child.props.children.startsWith(value)
          )}
        </ul>
      </div>
    );
  }
);
export const randomDate = (start = null, end = null) => {
  if (!start) {
    start = new Date(2020, 1, 1);
  }
  if (!end) {
    end = new Date();
  }
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};
