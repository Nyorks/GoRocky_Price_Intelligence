// Repository for Competitor CRUD operations
import prisma from '../db/client';
import { CreateCompetitorRequest, UpdateCompetitorRequest } from '../types';

export const competitorRepository = {
  async create(data: CreateCompetitorRequest) {
    return await prisma.competitor.create({
      data,
    });
  },

  async findAll() {
    return await prisma.competitor.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return await prisma.competitor.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: UpdateCompetitorRequest) {
    return await prisma.competitor.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return await prisma.competitor.delete({
      where: { id },
    });
  },

  async findByName(name: string) {
    return await prisma.competitor.findUnique({
      where: { name },
    });
  },
};

