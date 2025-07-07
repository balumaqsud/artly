import { registerEnumType } from '@nestjs/graphql';

export enum ArticleCategory {
  FREE = 'FREE',
  RECOMMEND = 'RECOMMEND',
  NEW = 'NEW',
  OLD = 'OLD',
}
registerEnumType(ArticleCategory, {
  name: 'ArticleCategory',
});

export enum ArticleStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}
registerEnumType(ArticleStatus, {
  name: 'ArticleStatus',
});
