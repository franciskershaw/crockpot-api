class BadRequestError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  statusCode: number;
  errorCode: string;
  constructor(message: string, errorCode: string) {
    super(message);
    this.statusCode = 401;
    this.errorCode = errorCode;
  }
}

class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

class ForbiddenError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}

class ConflictError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 409;
  }
}

class InternalServerError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 500;
  }
}

class ServiceUnavailableError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 503;
  }
}

export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
  InternalServerError,
  ServiceUnavailableError,
};
