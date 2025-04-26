import LiveStream from "@models/liveStream";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { date } from "zod";

const start = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const { roomId } = req.body;
  const [error, liveStream] = await to(LiveStream.create({ user: userId, roomId: roomId }));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: liveStream });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [error, liveStreams] = await to(
    LiveStream.find().populate("user").skip(skip).limit(limit).lean(),
  );
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: liveStreams });
};

const end = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { streamId } = req.body;
  const [error, stream] = await to(LiveStream.findByIdAndDelete(streamId));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: stream });
};

const LiveStreamController = {
  start,
  getAll,
  end,
};

export default LiveStreamController;
