import { Schema } from 'mongoose';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
  {
    notificationType: {
      type: NotificationType,
      enum: NotificationType,
      required: true,
    },

    notificationStatus: {
      type: NotificationStatus,
      enum: NotificationStatus,
      required: true,
    },

    notificationGroup: {
      type: NotificationGroup,
      enum: NotificationGroup,
      required: true,
    },

    notificationMessage: { type: String, required: true },

    targetRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },
  },
  { timestamps: true, collection: 'likes' },
);

NotificationSchema.index({ memberId: 1, targetRefId: 1 }, { unique: true });

export default NotificationSchema;
