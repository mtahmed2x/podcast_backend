"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.Gender = exports.Subject = exports.Months = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["CREATOR"] = "CREATOR";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var Months;
(function (Months) {
    Months["JAN"] = "JAN";
    Months["FEB"] = "FEB";
    Months["MAR"] = "MAR";
    Months["APR"] = "APR";
    Months["MAY"] = "MAY";
    Months["JUN"] = "JUN";
    Months["JUL"] = "JUL";
    Months["AUG"] = "AUG";
    Months["SEP"] = "SEP";
    Months["OCT"] = "OCT";
    Months["NOV"] = "NOV";
    Months["DEC"] = "DEC";
})(Months || (exports.Months = Months = {}));
var Subject;
(function (Subject) {
    Subject["LIKE"] = "LIKE";
    Subject["COMMENT"] = "COMMENT";
    Subject["APPROVED"] = "APPROVED";
    Subject["BLOCKED"] = "BLOCKED";
    Subject["DELETED"] = "DELETED";
    Subject["REPORTED"] = "REPORTED";
    Subject["PLAN"] = "PLAN";
    Subject["PLAN_CANCELLED"] = "PLAN_CANCELLED";
    Subject["PAYMENT_SUCCESSED"] = "PAYMENT_SUCCESSED";
    Subject["PAYMENT_FAILED"] = "PAYMENT_FAILED";
})(Subject || (exports.Subject = Subject = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["PENDING"] = "pending";
    SubscriptionStatus["PAYMENT_FAILED"] = "payment_failed";
    SubscriptionStatus["CANCELED"] = "canceled";
    SubscriptionStatus["AUTO_CANCELED"] = "canceled_due_to_failed_payments";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
