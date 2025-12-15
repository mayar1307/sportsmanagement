const AuthServices = require('../services/AuthServices');

class AuthController {
    constructor() {
        this.authService = new AuthServices();
    }

    register = async (req, res, next) => {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json({ status: 'success', data: user });
        } catch (err) {
            next(err);
        }
    };

    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.json({ status: 'success', data: result });
        } catch (err) {
            next(err);
        }
    };
}

module.exports = AuthController;
