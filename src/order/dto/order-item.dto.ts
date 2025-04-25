import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  menuId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
} 