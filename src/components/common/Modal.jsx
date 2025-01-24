import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <dialog open>
      <article>
        {children}
        <footer>
          <button onClick={onClose}>OK</button>
        </footer>
      </article>
    </dialog>
  );
};

export default Modal;