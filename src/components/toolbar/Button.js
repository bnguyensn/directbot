import React from 'react';
import styles from './toolbar.module.css';

export default function Button({ children, paperContext, ...rest }) {
  return (
    <div role="button" className={styles.button} {...rest}>
      {children}
    </div>
  );
}
