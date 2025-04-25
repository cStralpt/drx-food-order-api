import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMenuDto) {
    return this.prisma.menu.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.menu.findMany();
  }

  async findOne(id: string) {
    return this.prisma.menu.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateMenuDto) {
    return this.prisma.menu.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
