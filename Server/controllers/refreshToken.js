//const usersDB = {
    //users: require('../models/users.json'),
  //  setUsers: function (data) { this.users = data }
//}
var ProductController = require('../controllers/product');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    const controller = new ProductController(res.locals.dburi,'users');
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const foundUser = await controller.getDataToken(refreshToken);
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                { "UserInfo": {
                    "username": decoded.username,
                    "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );
            res.json({ accessToken })
        }
    );
}

module.exports = { handleRefreshToken }
