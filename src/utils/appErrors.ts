import { getReasonPhrase, StatusCodes } from "http-status-codes";

export class AppError extends Error {
    public readonly code: number;
    public readonly status: number | string;
    public readonly isOperational: boolean;
    public readonly errors: any[];
  constructor(code: number, message: string, errors: any[]) {
    const status = getReasonPhrase(code);
    super(message || status);
    this.code = code;
    this.status = status;
    this.isOperational=true
    this.errors = errors || [];
  }
  toJSON() {
    return {
      code: this.code,
      status: this.status,
      message: this.message,
      errors: this.errors,
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.UNAUTHORIZED, message, errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.FORBIDDEN, message, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.NOT_FOUND, message, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.CONFLICT, message || 'Operation cannot be completed due to a conflict with the current state of the resource.', errors);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.TOO_MANY_REQUESTS, message, errors);
  }
}

export class AlreadyExistsError extends AppError {
  constructor(message: string, errors: any[] = []) {
    super(StatusCodes.CONFLICT, message, errors);
  }
}

export class AuthorizationError extends AppError{
  constructor(message:string,errors:any[]=[]){
    super(StatusCodes.UNAUTHORIZED, message, errors);
  }
}