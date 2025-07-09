import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
  MEMBER = 'MEMBER',
  PROPERTY = 'PROPERTY',
  ARTICLE = 'ARTICLE',
  COMMENT = 'COMMENT',
}
registerEnumType(LikeGroup, {
  name: 'LikeGroup',
});
