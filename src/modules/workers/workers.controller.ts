import { sendSuccess } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { notificationProcessorService } from '../notifications/notification-processor.service';
import { ProcessNotificationsInput } from './workers.schemas';

export const workersController = {
  processNotificationsLocal: asyncHandler(async (req, res) => {
    const input = req.body as ProcessNotificationsInput;

    const result = await notificationProcessorService.processPendingEvents(
      input.limit,
    );

    return sendSuccess(
      res,
      200,
      'Notification events processed successfully',
      result,
    );
  }),
};
