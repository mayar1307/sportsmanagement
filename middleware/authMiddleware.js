const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.protect = (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('You are not logged in!', 401));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission.', 403));
        }
        next();
    };
};
