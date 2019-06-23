import React from 'react';
import paper from 'paper';

export const paperScope = new paper.PaperScope();
export const PaperContext = React.createContext(paperScope);
