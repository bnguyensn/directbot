# 2DPipes (NOOP version)

[Windows Pipes screensaver](https://www.youtube.com/watch?v=Uzx9ArZ7MUU), but 2D 🤗.

How the pipes are generated can be modified using a central settings.

Animations can be played / paused.

The NOOP [Directbot](https://noopschallenge.com/challenges/directbot) and [Hexbot](https://noopschallenge.com/challenges/hexbot) are pre-queried every 0.5s to obtain future pipe data unless we have data for 3 pipes that haven't yet been used (animated).

### NOOP Usage

- [Directbot](https://noopschallenge.com/challenges/directbot) (to draw the pipes)
- [Hexbot](https://noopschallenge.com/challenges/hexbot) (to color the pipes)

### App Packages

- [React](https://reactjs.org)
- [Paper.js](https://paperjs.org)

### Build Tool

- [webpack](https://webpack.js.org)

### To-Do

- Move NOOP API calls and Paper.js path initializations out to a web worker
- Add pipe configuration functionality
- Improve view resize experience
