import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  public sayGraphQL(): string {
    return 'hi graphQL';
  }
}
