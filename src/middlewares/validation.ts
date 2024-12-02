import { Request, Response, NextFunction } from "express";
import { AuthValidatorSchema, createPodcastValidationSchema, FileSchema, ObjectIdSchema } from "@schemas/validation";
import { fromZodError } from "zod-validation-error";
import createError from "http-errors";
import httpStatus from "http-status";

export const ParamValidator = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const result = ObjectIdSchema.safeParse(req.params.id);
  if (!result.success) {
    return next(createError(httpStatus.BAD_REQUEST, fromZodError(result.error)));
  }
  next();
};

export const validateRegisterInput = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const result = AuthValidatorSchema.safeParse(req.body);
  if (!result.success) {
    return next(createError(httpStatus.BAD_REQUEST, fromZodError(result.error)));
  }
  next();
};

type PodcastFiles = Express.Request & {
  files: { [fieldname: string]: Express.Multer.File[] };
};

export const createPodcastValidator = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const result = createPodcastValidationSchema.safeParse(req.body);
  if (!result.success) {
    return next(createError(httpStatus.BAD_REQUEST, fromZodError(result.error)));
  }
  const { audio, cover } = (req as PodcastFiles).files || {};

  if (!audio || !audio[0]) {
    return next(createError(httpStatus.BAD_REQUEST, "Audio file is required."));
  }
  if (!cover || !cover[0]) {
    return next(createError(httpStatus.BAD_REQUEST, "Cover file is required."));
  }

  const audioResult = FileSchema.safeParse(audio[0]);
  const coverResult = FileSchema.safeParse(cover[0]);

  if (!audioResult.success) {
    return next(createError(httpStatus.BAD_REQUEST, `Unsupported or Corrupted audio: ${audioResult.error.message}`));
  }
  if (!coverResult.success) {
    return next(createError(httpStatus.BAD_REQUEST, `Unsupported or Corrupted cover: ${coverResult.error.message}`));
  }
  next();
};
