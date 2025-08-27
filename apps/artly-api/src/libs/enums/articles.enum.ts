import { registerEnumType } from '@nestjs/graphql';

export enum ArticleCategory {
  FREE = 'FREE',
  RECOMMEND = 'RECOMMEND',
  NEW = 'NEW',
}
registerEnumType(ArticleCategory, {
  name: 'ArticleCategory',
});

//fixes

export enum ArticleStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}
registerEnumType(ArticleStatus, {
  name: 'ArticleStatus',
});
