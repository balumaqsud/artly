import { Schema } from 'mongoose';
import { ProductStatus, ProductType } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
  {
    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },

    productCategory: { type: String, required: true },

    productTags: {
      type: [String],
    },

    productShippingTime: { type: String },

    productShippingCost: { type: Number, default: 0 },

    productMaterials: {
      type: [String],
      required: true,
    },

    productWrapAvailable: { type: Boolean, default: false },

    productPersonalizable: { type: Boolean, default: false },

    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },

    productLocation: {
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

    productStock: { type: Number, default: 0 },

    productSlug: { type: String, unique: true },

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

export default ProductSchema;
