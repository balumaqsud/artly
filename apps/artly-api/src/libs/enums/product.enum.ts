import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
  CLOTHING = 'CLOTHING',
  HOME_LIVING = 'HOME AND LIVING',
  ACCESSORY = 'ACCESSORY',
  HANDMADE = 'HANDMADE',
  VINTAGE = 'VINTAGE',
  CRAFT_SUPPLIES = 'CRAFT SUPPLIES',
  JEWELRY = 'JEWELRY',
  PET_PRODUCTS = 'PET PRODUCTS',
  ART_COLLECTABLES = 'ART AND COLLECTABLES',
  CHILDREN = 'CHILDREN',
}
registerEnumType(ProductType, {
  name: 'ProductType',
});

export enum ProductStatus {
  HOLD = 'HOLD',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  DELETE = 'DELETE',
}
registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});
