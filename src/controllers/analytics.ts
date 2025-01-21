import Analytics from "@models/analytics";
import { Months } from "@shared/enums";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";

const getAnalyticsByYear = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { year } = req.body;

  const allMonths = Object.values(Months);

  const [error, analytics] = await to(Analytics.find({ year }));
  if (error) return next(error);

  const incomeArray: any = [];
  const usersArray: any = [];

  if (analytics.length === 0) {
    allMonths.forEach((month) => {
      incomeArray.push({ month: month, income: 0 });
      usersArray.push({ month: month, users: 0 });
    });
  } else {
    allMonths.forEach((month) => {
      const monthData = analytics.find((item) => item.month === month);
      if (monthData) {
        incomeArray.push({ month: month, income: monthData.income });
        usersArray.push({ month: month, users: monthData.users });
      } else {
        incomeArray.push({ month: month, income: 0 });
        usersArray.push({ month: month, users: 0 });
      }
    });
  }

  return res.status(200).json({
    success: true,
    message: "Success",
    data: {
      incomeArray,
      usersArray,
    },
  });
};

export default getAnalyticsByYear;
