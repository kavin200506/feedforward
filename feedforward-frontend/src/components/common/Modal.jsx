import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal modal-${size} slide-up`} role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          {showCloseButton && (
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;


