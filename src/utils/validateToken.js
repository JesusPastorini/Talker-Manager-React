const HTTP_UNAUTHORIZED_STATUS = 401;

// Middleware para validar o token de autenticação
const validateToken = (req, res, next) => {
    const { authorization } = req.headers;
  
    if (!authorization) {
      return res.status(401).json({ message: 'Token não encontrado' });
    }
  
    if (!authorization || authorization.length !== 16 || typeof authorization !== 'string') {
      return res.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token inválido' });
    }
  
    next();
  };

  module.exports = { validateToken };