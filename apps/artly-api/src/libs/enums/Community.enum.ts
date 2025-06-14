import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
  FREE = 'FREE',
  RECOMMEND = 'RECOMMEND',
  NEW = 'NEW',
  OLD = 'OLD',
}
registerEnumType(BoardArticleCategory, {
  name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, {
  name: 'BoardArticleStatus',
});
