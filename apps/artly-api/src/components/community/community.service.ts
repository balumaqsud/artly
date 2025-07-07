import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { BoardArticle } from '../../libs/dto/board-article/board-article';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel('Community')
    private readonly communityModel: Model<BoardArticle>,
    private memberService: MemberService,
    private viewService: ViewService,
    // private likeService: LikeService,
  ) {}
}
