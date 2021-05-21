import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ description: 'the email of the user' })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  @ApiProperty({ description: 'the password of the user' })
  readonly password: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'the role of the user' })
  readonly role: string;

  @IsOptional()
  @IsPositive()
  @ApiProperty({ description: 'Customer Id' })
  readonly customerId: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
