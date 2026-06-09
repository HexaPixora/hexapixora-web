import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const count = await this.prisma.teamMember.count();
    return this.prisma.teamMember.create({ data: { ...data, order: count } });
  }

  async findAll() {
    return this.prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.teamMember.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamMember.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.teamMember.update({ where: { id }, data: { order: index } })
    );
    return Promise.all(updates);
  }
}
