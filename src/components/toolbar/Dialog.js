import React from 'react';
import styles from './toolbar.module.css';
import cls from '../../lib/cls';

export default function Dialog({ shown, content }) {
  return (
    <div
      className={cls([
        styles.dialog,
        { condition: !shown, cls: styles.hidden },
      ])}
    >
      {content}
    </div>
  );
}
