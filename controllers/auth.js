
const UserModel = require('../models/models_chimio/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const saltRounds = 10;
const tokenExpiryTime = 60 * 60  



const signup = async (req, res) => {
    try {
        const { email, password } = req.body; 

        const hash = await bcrypt.hash(password, saltRounds);
        
        let role = 'patient'; // Default role is 'patient'

        const response = await UserModel.create({ email, password: hash, ref_ch: null, ref_r: null, role });

        res.status(201).send(response);
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).send(error);
    }
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({  where: { email: email }, });
        const hash = user.password;
        const passwordResult = await bcrypt.compare(password, hash);

        if (passwordResult) {
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_KEY, { expiresIn: tokenExpiryTime });
            res.send({token});
        } else {
            res.status(500).send('Email or password is incorrect.');
        }


    } catch (error) {
        console.log(error);
        res.status(error.status || 500).send({ error });
    }
}



module.exports = {
    signup,
    login,
}