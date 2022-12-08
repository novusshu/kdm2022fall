import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import Backdrop from "./Backdrop";
import './SideDrawer.css';

const ModalOverlay = props => {
  const content = (
    <div className={`modal ${props.className}`} style={props.style}>
      <header className={`side-drawer_header ${props.headerClass}`}>
        <h2>{props.header}</h2>
      </header>
      <form
        onSubmit={
          props.onSubmit ? props.onSubmit : event => event.preventDefault()
        }
      >
        <div className={`modal__content ${props.contentClass}`}>
          {props.children}
        </div>
        <footer className={`modal__footer ${props.footerClass}`}>
          {props.footer}
        </footer>
      </form>
    </div>
  );
  return ReactDOM.createPortal(content, document.getElementById('drawer-hook'));
};


const SideDrawer = props => {
  return (
    <>
    {props.show && <Backdrop onClick={props.onCancel} />}
    <CSSTransition
      in={props.show}
      mountOnEnter
      unmountOnExit
      timeout={100}
      classNames="slide-in-left"
    >
      <ModalOverlay className="side-drawer"  {...props} />
    </CSSTransition>
    </>
  );
};

export default SideDrawer;
