
const UserService = require('../services/UserService');

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    getAll = async (req, res, next) => {
        try {
            const users = await this.userService.getAllUsers();
            res.json({ status: 'success', data: users });
        } catch (err) {
            next(err);
        }
    };

    getById = async (req, res, next) => {
        try {
            const user = await this.userService.getUserById(req.params.id);
            res.json({ status: 'success', data: user });
        } catch (err) {
            next(err);
        }
    };

    add = async (req, res, next) => {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({ status: 'success', data: user });
        } catch (err) {
            next(err);
        }
    };

    update = async (req, res, next) => {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            res.json({ status: 'success', data: user });
        } catch (err) {
            next(err);
        }
    };

    delete = async (req, res, next) => {
        try {
            await this.userService.deleteUser(req.params.id);
            res.json({ status: 'success', message: 'User deleted' });
        } catch (err) {
            next(err);
        }
    };
}
module.exports = UserController;