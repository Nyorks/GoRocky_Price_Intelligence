// Repository for Product CRUD operations
import prisma from '../db/client';
import { CreateProductRequest, UpdateProductRequest } from '../types';

export const productRepository = {
  async create(data: CreateProductRequest) {
    return await prisma.product.create({
      data: {
        ...data,
        currency: data.currency || 'USD',
      },
    });
  },

  async findAll() {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  },

  async findBySku(internalSku: string) {
    return await prisma.product.findUnique({
      where: { internalSku },
    });
  },

  async update(id: string, data: UpdateProductRequest) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  },
};

