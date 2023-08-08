module.exports = (rows) => {
  return rows.map((row) => {
    const replaced = {};
    for (let key in row) {
      const camleCase = key.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace('_', '')
      );
      replaced[camleCase] = row[key];
    }
    return replaced;
  });
};
