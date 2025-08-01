import { Schema } from 'mongoose';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
  {
    notificationType: {
      type: String,
      enum: NotificationType,
      required: true,
    },

    notificationStatus: {
      type: String,
      enum: NotificationStatus,
      default: NotificationStatus.WAIT,
    },

    notificationGroup: {
      type: String,
      enum: NotificationGroup,
      required: true,
    },

    notificationMessage: {
      type: String,
    },

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
  { timestamps: true, collection: 'notifications' },
);

NotificationSchema.index(
  { memberId: 1, targetRefId: 1, notificationGroup: 1 },
  { unique: true },
);

export default NotificationSchema;
