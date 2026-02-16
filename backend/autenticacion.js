//autenticación simple con x-token
const simpleAuth = (req, res, next) => {
    const token = req.headers['x-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. Se requiere token de autenticación.'
        });
    }
    const match = token.match(/^user-(\d+)$/);
    if (!match) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido. Formato esperado: user-NUMERO'
        });
    }
    req.usuario_id = parseInt(match[1]);   
    next();
};

export default simpleAuth;