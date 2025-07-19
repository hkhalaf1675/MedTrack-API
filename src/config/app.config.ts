export default () => ({
    port: parseInt(process.env.PORT ?? '6001', 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['*'],
    jwt: {
        secret: process.env.JWT_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be defined in production');
        }
        return 'development-secret';
        })(),
        expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
    },
});