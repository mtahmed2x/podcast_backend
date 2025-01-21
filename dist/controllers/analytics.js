"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_1 = __importDefault(require("../models/analytics"));
const enums_1 = require("../shared/enums");
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const getAnalyticsByYear = async (req, res, next) => {
    const { year } = req.body;
    const allMonths = Object.values(enums_1.Months);
    const [error, analytics] = await (0, await_to_ts_1.default)(analytics_1.default.find({ year }));
    if (error)
        return next(error);
    const incomeArray = [];
    const usersArray = [];
    if (analytics.length === 0) {
        allMonths.forEach((month) => {
            incomeArray.push({ month: month, income: 0 });
            usersArray.push({ month: month, users: 0 });
        });
    }
    else {
        allMonths.forEach((month) => {
            const monthData = analytics.find((item) => item.month === month);
            if (monthData) {
                incomeArray.push({ month: month, income: monthData.income });
                usersArray.push({ month: month, users: monthData.users });
            }
            else {
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
exports.default = getAnalyticsByYear;
