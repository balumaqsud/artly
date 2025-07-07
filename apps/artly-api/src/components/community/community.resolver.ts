import { Resolver } from '@nestjs/graphql';
import { CommunityService } from './community.service';

@Resolver()
export class CommunityResolver {
  constructor(private readonly communityService: CommunityService) {}
}
