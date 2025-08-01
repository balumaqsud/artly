import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const availableSellers = [
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

export const availableCommentSorts = ['createdAt', 'updatedAt'];

export const availableProductSorts = [
  'createdAt',
  'updatedAt',
  'productRank',
  'productViews',
  'productLikes',
  'productPrice',
];

export const availableArticleSorts = [
  'createdAt',
  'updatedAt',
  'articleLikes',
  'articleViews',
];

export const lookUpMember = {
  $lookup: {
    from: 'members',
    localField: 'memberId',
    foreignField: '_id',
    as: 'memberData',
  },
};

export const lookUpOrders = {
  $lookup: {
    from: 'orderItems',
    localField: '_id',
    foreignField: 'orderId',
    as: 'orderItems',
  },
};

export const lookUpProducts = {
  $lookup: {
    from: 'products',
    localField: 'orderItems.productId',
    foreignField: '_id',
    as: 'productData',
  },
};

// IMAGE CONFIGURATION (config.js)

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
  const ext = path.parse(filename).ext;
  return uuidv4() + ext;
};

export const lookupMember = {
  $lookup: {
    from: 'members',
    localField: 'memberId',
    foreignField: '_id',
    as: 'memberData',
  },
};

export const lookupFollowingData = {
  $lookup: {
    from: 'members',
    localField: 'followingId',
    foreignField: '_id',
    as: 'followingData',
  },
};

export const lookupFollowerData = {
  $lookup: {
    from: 'members',
    localField: 'followerId',
    foreignField: '_id',
    as: 'followerData',
  },
};

export const lookupFavorite = {
  $lookup: {
    from: 'members',
    localField: 'favoriteProduct.memberId',
    foreignField: '_id',
    as: 'favoriteProduct.memberData',
  },
};

export const lookupVisit = {
  $lookup: {
    from: 'members',
    localField: 'visitProduct.memberId',
    foreignField: '_id',
    as: 'visitProduct.memberData',
  },
};

// complex query logics

export const lookUpAuthMemberLiked = (
  memberId: T,
  targetRefId: string = '$_id',
) => {
  return {
    $lookup: {
      from: 'likes',
      let: {
        localLikeRefId: targetRefId,
        localMemberId: memberId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$likeRefId', '$$localLikeRefId'] },
                { $eq: ['$memberId', '$$localMemberId'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: '$$localMyFavorite',
          },
        },
      ],
      as: 'meLiked',
    },
  };
};

interface LookUpAuthMemberFollowed {
  followerId: T;
  followingId: string;
}

export const lookUpAuthMemberFollowed = (input: LookUpAuthMemberFollowed) => {
  const { followerId, followingId } = input;
  return {
    $lookup: {
      from: 'follows',
      let: {
        localLikeRefId: followerId,
        localMemberId: followingId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$followerId', '$$localLikeRefId'] },
                { $eq: ['$followingId', '$$localMemberId'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            followerId: 1,
            followingId: 1,
            myFollowing: '$$localMyFavorite',
          },
        },
      ],
      as: 'meFollowed',
    },
  };
};
