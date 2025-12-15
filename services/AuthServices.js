const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

class AuthServices {
    constructor() {
        this.userRepo = new UserRepository();
    }

async register(data) {
    const existingUser = await this.userRepo.getByEmail(data.email);
    if (existingUser) {
        throw new AppError('Email already exists', 400);
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.userRepo.create({
        ...data,
        password: hashedPassword
    });

    return user;
}


    async login(email, password) {
        const [rows] = await this.userRepo.getAll(); 
        const user = rows.find(u => u.email === email);
        if (!user) throw new AppError('Incorrect email or password', 401);

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new AppError('Incorrect email or password', 401);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        });

        return { token, user: { id: user.id, email: user.email, role: user.role } };
    }

    async login(email, password) {
    const user = await this.userRepo.getByEmail(email); 
    
    if (!user) throw new AppError('Incorrect email or password', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Incorrect email or password', 401);

    // 3. Generate the token
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
    
    delete user.password; 
    return { token, user: { id: user.user_id, email: user.email, role: user.role } };
}
}

module.exports = AuthServices;
