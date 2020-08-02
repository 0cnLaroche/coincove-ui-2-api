class OrderError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
    
}

module.exports = OrderError;