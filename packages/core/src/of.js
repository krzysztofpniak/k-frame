const Array$of = x => [x];
const Function$of = x => _ => x;

const of = typeRep => value =>
  (typeRep === Array
    ? Array$of
    : typeRep === Function
    ? Function$of
    : typeRep['fantasy-land/of'])(value);

export default of;
