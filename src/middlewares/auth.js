const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../config');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).send({ error: "Requisição sem token" });
    
    const parts = authHeader.split(' ');

    if (!parts.length === 2)
        return res.status(401).send({ error: "Autorização incompleta" });
    
    const [ scheme, token ] = parts;

    if (!/Bearer$/i.test(scheme)) 
        return res.status(401).send({ error: "Token mal formatado" });

    //Token verification
    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).send({ error: "Token inválido" });
        
        req.userId = decoded.id;
            
        return next();
    }); 
};