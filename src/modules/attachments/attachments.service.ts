import { AttachmentStorageProvider, UserRole } from '@prisma/client';
import { AppError } from '../../common/errors/app-error';
import { prisma } from '../../config/prisma';
import { ticketAccessService } from '../tickets/ticket-access.service';
import { CreatePresignedUrlInput } from './attachments.schemas';
import { attachmentsRepository } from './attachments.repository';
import { ticketCacheService } from '../tickets/ticket-cache.service';
import { activityLogService } from '../activity-logs/activity-log.service';
import { ActivityLogType } from '../activity-logs/activity-log.types';
import { saveAttachmentLocally } from './local-storage.service';
import { createAttachmentPresignedUrl } from './s3-presigned.service';

type CurrentUser = {
  id: string;
  role: UserRole;
};

export const attachmentsService = {
  async uploadLocalAttachment(
    ticketId: string,
    user: CurrentUser,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new AppError(400, 'Attachment file is required', 'FILE_REQUIRED');
    }

    await ticketAccessService.ensureCanUploadAttachment(ticketId, user);

    const savedFile = await saveAttachmentLocally({
      ticketId,
      originalName: file.originalname,
      buffer: file.buffer,
    });

    const result = await prisma.$transaction(async (tx) => {
      const attachment = await attachmentsRepository.createAttachment(
        {
          ticketId,
          uploadedById: user.id,
          fileName: savedFile.fileName,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storageProvider: AttachmentStorageProvider.LOCAL,
          storageKey: savedFile.storageKey,
        },
        tx,
      );

      await attachmentsRepository.createAttachmentOutboxEvent(
        {
          ticketId,
          actorId: user.id,
          attachmentId: attachment.id,
          storageProvider: AttachmentStorageProvider.LOCAL,
        },
        tx,
      );

      return attachment;
    });
    await activityLogService.createActivityLogSafely({
      ticketId,
      actorId: user.id,
      actorRole: user.role,
      type: ActivityLogType.ATTACHMENT_UPLOADED,
      message: 'Attachment uploaded',
      metadata: {
        attachmentId: result.id,
        fileName: result.fileName,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        storageProvider: result.storageProvider,
      },
    });

    await ticketCacheService.invalidateTicket(ticketId);

    return {
      attachment: result,
    };
  },

  async listAttachments(ticketId: string, user: CurrentUser) {
    await ticketAccessService.ensureCanViewTicket(ticketId, user);

    const attachments =
      await attachmentsRepository.listTicketAttachments(ticketId);

    return {
      count: attachments.length,
      attachments,
    };
  },

  async createPresignedUrl(
    ticketId: string,
    user: CurrentUser,
    input: CreatePresignedUrlInput,
  ) {
    await ticketAccessService.ensureCanUploadAttachment(ticketId, user);

    const result = await createAttachmentPresignedUrl({
      ticketId,
      input,
    });

    return result;
  },
};
