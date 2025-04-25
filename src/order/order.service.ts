import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto';
import { OrderStatus } from './entities/order-status.enum';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, items } = createOrderDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const menuIds = items.map(item => item.menuId);
    const menuItems = await this.prisma.menu.findMany({
      where: {
        id: {
          in: menuIds,
        },
      },
    });

    if (menuItems.length !== menuIds.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    let total = 0;
    const orderItemsData = items.map(item => {
      const menu = menuItems.find(m => m.id === item.menuId);
      if (!menu) {
        throw new BadRequestException(`Menu item with ID ${item.menuId} not found`);
      }
      const itemTotal = menu.price * item.quantity;
      total += itemTotal;
      
      return {
        menuId: item.menuId,
        quantity: item.quantity,
      };
    });

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              menu: true,
            },
          },
        },
      });

      return newOrder;
    });

    return this.generateInvoice(order);
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });

    return orders.map(order => this.generateInvoice(order));
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.generateInvoice(order);
  }

  private generateInvoice(order) {
    const items = order.orderItems.map(item => ({
      id: item.id,
      menuName: item.menu.name,
      menuPrice: item.menu.price,
      quantity: item.quantity,
      subtotal: item.menu.price * item.quantity,
    }));

    return {
      invoice: {
        id: order.id,
        orderDate: order.createdAt,
        status: order.status,
        customer: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
        },
        items,
        total: order.total,
      }
    };
  }
}
