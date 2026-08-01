const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("================================");
        console.log("LOGIN REQUEST");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("================================");

        // Find active user
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ? AND status = 'Active'",
            [email]
        );

        console.log("Users Found:", rows.length);

        // User not found
        if (rows.length === 0) {

            console.log("❌ User not found or inactive");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const user = rows[0];

        console.log("================================");
        console.log("DATABASE USER");
        console.log("ID:", user.id);
        console.log("Email:", user.email);
        console.log("Role:", user.role);
        console.log("Status:", user.status);
        console.log("Stored Hash:", user.password);
        console.log("================================");

        // Compare password
        const match = await bcrypt.compare(password, user.password);

        console.log("Password Match:", match);

        if (!match) {

            console.log("❌ Password is incorrect");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        console.log("✅ Login Successful");

        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {

        console.log("================================");
        console.log("LOGIN ERROR");
        console.log(err);
        console.log("================================");

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};