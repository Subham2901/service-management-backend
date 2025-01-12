import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'CustomDateRangeValidator', async: false })
export class CustomDateRangeValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as any;
    return object.begin < object.end;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'The start date (begin) must be earlier than the end date.';
  }
}
