const app = require("./app");
const { CORE } = require("./constants");

app.listen(CORE.PORT, () =>
  console.log(`Server is running on port ${CORE.PORT}`)
);
