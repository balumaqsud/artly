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

    productTags: [{ type: String }],

    productOptions: [
      {
        name: { type: String }, // e.g., "Size"
        values: [{ type: String }], // e.g., ["Small", "Large"]
      },
    ],

    productShippingTime: { type: String }, // e.g., "3-5 business days"

    productShippingCost: { type: Number, default: 0 },

    productMaterials: [{ type: String }],

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

ProductSchema.index(
  { productType: 1, productLocation: 1, productTitle: 1, productPrice: 1 },
  { unique: true },
);

export default ProductSchema;
