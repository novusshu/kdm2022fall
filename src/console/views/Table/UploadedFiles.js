import { useUserAuth } from "../../../context/UserAuthContext";
import AvailableTables from "./AvailableTables";

export default function UploadedFiles() {

  const { user, userData } = useUserAuth();
  return (
    <>
      <AvailableTables
        userID={user.uid}
        userData={userData}
      />
    </>
  )
}
