import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children,
  showOKButton = true,
}) => {
  if (!isOpen) return null;

  return (
    <dialog open>
      <article>
        {children}
        <footer hidden={!showOKButton}>
          <button onClick={onClose}>OK</button>
        </footer>
      </article>
    </dialog>
  );
};

export default Modal;