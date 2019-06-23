export default function cls(classes) {
  if (Array.isArray(classes) && classes.length > 1) {
    return classes
      .reduce((acc, cur) => {
        if (typeof cur === 'object' && cur !== null) {
          return `${acc} ${cur.condition ? cur.cls : ''}`;
        }

        return `${acc} ${cur}`;
      }, '')
      .trim();
  }

  return classes;
}
