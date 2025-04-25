import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post,
  UseGuards 
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    const deletedMenu = this.menuService.delete(id);
    return {
      message: 'Menu deleted successfully',
      deletedMenu
    }
  }
}
