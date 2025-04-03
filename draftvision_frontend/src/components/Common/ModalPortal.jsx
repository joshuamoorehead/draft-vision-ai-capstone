// src/components/Common/ModalPortal.jsx
import React from 'react';
import ReactDOM from 'react-dom';

const ModalPortal = ({ children }) => {
  const modalRoot = document.getElementById('modal-root') || document.body;
  return ReactDOM.createPortal(children, modalRoot);
};

export default ModalPortal;