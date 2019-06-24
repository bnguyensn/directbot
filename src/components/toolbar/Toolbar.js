import React from 'react';
import styles from './toolbar.module.css';
import Button from './Button';
import { ReactComponent as AddCircleOutline } from '../../assets/icons/AddCircleOutline.svg';
import { ReactComponent as InfoOutline } from '../../assets/icons/InfoOutline.svg';
import { ReactComponent as PlayCircleOutline } from '../../assets/icons/PlayCircleOutline.svg';
import { ReactComponent as PauseCircleOutline } from '../../assets/icons/PauseCircleOutline.svg';

export default function Toolbar({ allActions, isPlaying }) {
  const handleAdd = () => {
    allActions.add();
  };

  const handleSayInfo = () => {
    allActions.sayInfo();
  };

  return (
    <div className={styles.toolbar}>
      <Button onClick={handleAdd}>
        <AddCircleOutline className={styles.buttonIcon} />
      </Button>
      <Button onClick={allActions.togglePlaying}>
        {isPlaying ? (
          <PauseCircleOutline className={styles.buttonIcon} />
        ) : (
          <PlayCircleOutline className={styles.buttonIcon} />
        )}
      </Button>
      <Button onClick={handleSayInfo}>
        <InfoOutline className={styles.buttonIcon} />
      </Button>
    </div>
  );
}
