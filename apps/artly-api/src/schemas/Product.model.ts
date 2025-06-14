import { Schema } from 'mongoose';
import {
  ProductLocation,
  ProductStatus,
  ProductType,
} from '../libs/enums/product.enum';

const PropertySchema = new Schema(
  {
    propertyType: {
      type: String,
      enum: ProductType,
      required: true,
    },

    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },

    productLocation: {
      type: String,
      enum: ProductLocation,
      required: true,
    },

    productAddress: {
      type: String,
      required: true,
    },

    productTitle: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productViews: {
      type: Number,
      default: 0,
    },

    productLikes: {
      type: Number,
      default: 0,
    },

    productComments: {
      type: Number,
      default: 0,
    },

    productRank: {
      type: Number,
      default: 0,
    },

    productImages: {
      type: [String],
      required: true,
    },

    productDesc: {
      type: String,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    soldAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },

    constructedAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: 'products' },
);

PropertySchema.index(
  { propertyType: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 },
  { unique: true },
);

export default PropertySchema;
