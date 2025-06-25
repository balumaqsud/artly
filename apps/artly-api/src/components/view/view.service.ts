import { Injectable } from '@nestjs/common';
import { View } from '../../libs/dto/view/view';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    const result = await this.checkViewExistence(input);
    if (!result) {
      console.log('view created');
      return await this.viewModel.create(input);
    } else return null;
  }
  private async checkViewExistence(input: ViewInput): Promise<View | null> {
    const search: T = { memberId: input.memberId, viewRefId: input.viewRefId };
    return await this.viewModel.findOne(search).exec();
  }
}
