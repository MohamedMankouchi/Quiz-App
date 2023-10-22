import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Lobby } from "./Lobby";
export const Navigation = ({ socket }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <div className="nav">
        <h1>Quiz.IO</h1>
        <button variant="primary" onClick={handleShow}>
          Create Party
        </button>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Party</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Lobby socket={socket} onHide={handleClose} />
        </Modal.Body>
      </Modal>
    </>
  );
};
