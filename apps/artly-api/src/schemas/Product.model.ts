import { Schema } from 'mongoose';
import { ProductStatus, ProductType } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
  {
    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },

    productCategory: {
      type: String,
      required: true,
    },

    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },

    productTags: {
      type: [String],
      required: true,
    },

    productLocation: {
      type: String,
      required: true,
    },

    productShippingTime: {
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

    productMaterials: {
      type: [String],
      required: true,
    },

    productColor: {
      type: [String],
    },

    productDesc: {
      type: String,
    },

    productShippingCost: { type: Number, default: 0 },

    productWrapAvailable: { type: Boolean, default: false },

    productPersonalizable: { type: Boolean, default: false },

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
  },
  { timestamps: true, collection: 'products' },
);
ProductSchema.index({
  productType: 1,
  productCategory: 1,
  productStatus: 1,
  productPrice: 1,
  memberId: 1,
});

export default ProductSchema;
