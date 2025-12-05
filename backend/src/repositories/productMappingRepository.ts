// Repository for ProductMapping CRUD operations
import prisma from '../db/client';
import { CreateProductMappingRequest, UpdateProductMappingRequest } from '../types';

export const productMappingRepository = {
  async create(data: CreateProductMappingRequest) {
    return await prisma.productMapping.create({
      data: {
        ...data,
        selectors: data.selectors ? JSON.stringify(data.selectors) : undefined,
        isActive: data.isActive ?? true,
      },
      include: {
        product: true,
        competitor: true,
      },
    });
  },

  async findAll() {
    return await prisma.productMapping.findMany({
      include: {
        product: true,
        competitor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findActive() {
    return await prisma.productMapping.findMany({
      where: { isActive: true },
      include: {
        product: true,
        competitor: true,
      },
    });
  },

  async findById(id: string) {
    return await prisma.productMapping.findUnique({
      where: { id },
      include: {
        product: true,
        competitor: true,
      },
    });
  },

  async findByProductId(productId: string) {
    return await prisma.productMapping.findMany({
      where: { productId },
      include: {
        product: true,
        competitor: true,
      },
    });
  },

  async update(id: string, data: UpdateProductMappingRequest) {
    return await prisma.productMapping.update({
      where: { id },
      data: {
        ...data,
        selectors: data.selectors ? JSON.stringify(data.selectors) : undefined,
      },
      include: {
        product: true,
        competitor: true,
      },
    });
  },

  async delete(id: string) {
    return await prisma.productMapping.delete({
      where: { id },
    });
  },
};

