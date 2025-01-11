"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.Gender = exports.Subject = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["CREATOR"] = "CREATOR";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
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
