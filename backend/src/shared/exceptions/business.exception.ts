import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessRuleViolation } from '../interfaces/api-response.interface';

export class BusinessRuleException extends HttpException {
  constructor(violation: BusinessRuleViolation) {
    super(
      {
        success: false,
        message: violation.message,
        errors: [violation.message],
        code: violation.code,
        details: violation.details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(message: string, errors: string[]) {
    super(
      {
        success: false,
        message,
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class EntityNotFoundException extends HttpException {
  constructor(entityName: string, identifier: string | number) {
    super(
      {
        success: false,
        message: `No se encontró ${entityName} con el identificador ${identifier}`,
        errors: [`${entityName} no encontrado`],
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
