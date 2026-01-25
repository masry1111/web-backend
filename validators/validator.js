
const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;

    //Check if fields are empty
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    //Check password length
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    //Simple email check making sure @ is present
    if (!email.includes('@')) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    next(); //If every condition is successfully met, it proceed to the controller
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." });
    }

    next(); // Proceed to login logic
};

module.exports = { validateSignup, validateLogin };