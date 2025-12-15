const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');

class UserService {
    constructor() {
        this.userRepo = new UserRepository();
    }

    async getAllUsers() {
        return await this.userRepo.getAll();
    }

    async getUserById(id) {
        return await this.userRepo.getById(id);
    }

    async createUser(data) {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);
        return await this.userRepo.create({ ...data, password: hashedPassword });
    }

    async updateUser(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 12);
        }
        return await this.userRepo.update(id, data);
    }

    async deleteUser(id) {
        return await this.userRepo.delete(id);
    }
}

module.exports = UserService;
