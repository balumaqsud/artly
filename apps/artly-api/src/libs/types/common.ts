import { ObjectId } from 'mongoose';

/* eslint-disable prettier/prettier */
export interface T {
  [key: string]: any;
}

export interface StatisticModifier {
  _id: ObjectId;
  targetKey: string; //data key : member...., rank
  modifier: number;
}
