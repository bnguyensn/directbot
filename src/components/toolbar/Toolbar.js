import React from 'react';
import styles from './toolbar.module.css';
import Button from './Button';
import { ReactComponent as AddCircleOutline } from '../../assets/icons/AddCircleOutline.svg';

export default function Toolbar({ allActions }) {
  const handleAdd = () => {
    allActions.add();
  };

  return (
    <div className={styles.toolbar}>
      <Button onClick={handleAdd}>
        <AddCircleOutline className={styles.buttonIcon} />
      </Button>
    </div>
  );
}
