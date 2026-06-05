import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { notificationProcessorService } from './notification-processor.service';

export const notificationEventsController = {
  listNotificationEvents: asyncHandler(async (_req, res) => {
    const result =
      await notificationProcessorService.listNotificationEvents(50);

    return sendSuccess(
      res,
      200,
      'Notification events fetched successfully',
      result,
    );
  }),
};
