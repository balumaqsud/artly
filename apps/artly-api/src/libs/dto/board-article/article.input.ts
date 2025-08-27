import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ArticleCategory, ArticleStatus } from '../../enums/articles.enum';
import { Direction } from '../../enums/common.enum';
import { availableArticleSorts } from '../../config';

@InputType()
export class ArticleInput {
  @IsNotEmpty()
  @Field(() => ArticleCategory)
  articleCategory: ArticleCategory;

  @IsNotEmpty()
  @Length(3, 50)
  @Field(() => String)
  articleTitle: string;

  @IsNotEmpty()
  @Field(() => String)
  articleContent: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  articleImage?: string;

  memberId?: ObjectId;
}

@InputType()
class BAISearch {
  @IsOptional()
  @Field(() => ArticleCategory, { nullable: true })
  articleCategory?: ArticleCategory;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;
}

@InputType()
export class ArticlesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableArticleSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => BAISearch)
  search: BAISearch;
}

@InputType()
class ABAISearch {
  @IsOptional()
  @Field(() => ArticleStatus, { nullable: true })
  articleStatus?: ArticleStatus;

  @IsOptional()
  @Field(() => ArticleCategory, { nullable: true })
  articleCategory?: ArticleCategory;
}

@InputType()
export class AllArticlesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableArticleSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ABAISearch)
  search: ABAISearch;
}
