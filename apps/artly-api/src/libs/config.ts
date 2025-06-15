import { ObjectId } from 'bson';

export const availableAgents = [
  'createdAt',
  'updatedAt',
  'memberLikes',
  'memberViews',
  'memberRank',
];

export const availableMembers = [
  'createdAt',
  'updatedAt',
  'memberLikes',
  'memberViews',
];

export const shapeId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};
