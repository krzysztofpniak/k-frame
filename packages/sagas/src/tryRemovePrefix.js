const tryRemovePrefix = (prefix, text) => {
  if (text.indexOf(prefix) === 0) {
    return text.substr(prefix.length);
  } else {
    return null;
  }
};

export default tryRemovePrefix;
