import Dropdown from "react-bootstrap/Dropdown";


export default function Dashboard() {

  return (
    <>
      {/* <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Logout Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you would like to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={logOut}>
            Yes!
          </Button>
        </Modal.Footer>
      </Modal> */}
        <main>
          <h3 className="mt-3 text-center">Welcome!</h3>
          <p></p>
          <div>
            <Dropdown style={{ display: "inline" }}>
              <Dropdown.Toggle variant="outline-info" id="dropdown-basic">
                Create A New Table Form
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {/* <Dropdown.Item href="/forms/create">Online via Web <b>(Recommended)</b></Dropdown.Item> */}
                <Dropdown.Item href="/tablecsvupload">
                  Upload CSV or Excel
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </main>
    </>
  );
}
