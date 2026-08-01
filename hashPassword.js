// const bcrypt = require("bcrypt");

// async function generate() {

//     const hash = await bcrypt.hash("admin123", 10);

//     console.log(hash);

// }

// generate();

const bcrypt = require("bcrypt");

bcrypt.hash("Admin@123", 10).then(hash => {
    console.log(hash);
});