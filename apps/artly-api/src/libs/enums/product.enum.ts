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

export enum ProductLocation {
  SEOUL = 'SEOUL',
  BUSAN = 'BUSAN',
  INCHEON = 'INCHEON',
  DAEGU = 'DAEGU',
  GYEONGJU = 'GYEONGJU',
  GWANGJU = 'GWANGJU',
  CHONJU = 'CHONJU',
  DAEJON = 'DAEJON',
  JEJU = 'JEJU',
}
registerEnumType(ProductLocation, {
  name: 'ProductLocation',
});
