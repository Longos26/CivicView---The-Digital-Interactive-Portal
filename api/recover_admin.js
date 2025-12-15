import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import path from 'path';
import fs from 'fs';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const recoverAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const admins = await User.find({ isAdmin: true }, 'username email');
        fs.writeFileSync('admin_info.txt', JSON.stringify(admins, null, 2));
        await mongoose.disconnect();
        console.log('Done');
    } catch (error) {
        console.log(error);
    }
};

recoverAdmin();
