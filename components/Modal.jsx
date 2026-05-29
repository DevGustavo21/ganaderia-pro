'use client';

import { useEffect } from 'react';
import styles from './Modal.module.css';

export const Modal = ({ onClose, full = false, children }) => {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.dialogWrap}>
        <div
          className={`${styles.dialog} ${full ? styles.dialogFull : ''}`}
          role="dialog"
          aria-modal="true"
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.handle}><span /></div>
          {children}
        </div>
      </div>
    </>
  );
};
