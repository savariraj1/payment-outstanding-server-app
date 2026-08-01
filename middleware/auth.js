const jwt = require("jsonwebtoken");

// ===============================
// Verify JWT Token
// ===============================
function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access token missing"
        });
    }

    const token = authHeader.split(" ")[1];

    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("Token:", token);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {
            console.log("JWT ERROR:", err);
            return res.status(403).json({
                success: false,
                message: err.message
            });
        }

        console.log("Decoded User:", user);

        req.user = user;

        next();
    });

}

// ===============================
// Role Authorization
// ===============================
function authorizeRoles(...roles) {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "You don't have permission."
            });

        }

        next();

    };

}

// ===============================
// Role Authorization
// ===============================
function authorizeRoles(...roles) {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "You don't have permission."

            });

        }

        next();

    };

}

module.exports = {
    authenticateToken,
    authorizeRoles
};