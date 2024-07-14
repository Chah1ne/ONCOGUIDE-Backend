const jwt = require('jsonwebtoken');

const isAuthenticated = async(req, res, next) => {
    try {
        const token = await req.header('Authorization');
        if (!token) {
            return res.status(401).send('No token provided');
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res.status(401).send('Invalid token');
        }
        // If everything is fine, proceed to the next middleware
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send('You have to be authenticated');
    }
}

const isDoctor = async(req, res, next) => {
    try {
        const token =await req.header('Authorization');
        if (!token) {
            return res.status(401).send('No token provided');
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res.status(401).send('Invalid token');
        }
        // Check if the user role is 'doctor'
        if (decoded.role !== 'doctor') {
            console.log ('nigger: ',decoded.role);
            return res.status(403).send('Access denied. You are not a doctor');
        }
        // If everything is fine, proceed to the next middleware
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send('You have to be authenticated');
    }
}

module.exports = {
    isAuthenticated,
    isDoctor
};
