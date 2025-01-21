export enum Role {
  USER = "USER",
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
}

export enum Months {
  JAN = "JAN",
  FEB = "FEB",
  MAR = "MAR",
  APR = "APR",
  MAY = "MAY",
  JUN = "JUN",
  JUL = "JUL",
  AUG = "AUG",
  SEP = "SEP",
  OCT = "OCT",
  NOV = "NOV",
  DEC = "DEC",
}

export enum Subject {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  APPROVED = "APPROVED",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
  REPORTED = "REPORTED",
  PLAN = "PLAN",
  PLAN_CANCELLED = "PLAN_CANCELLED",
  PAYMENT_SUCCESSED = "PAYMENT_SUCCESSED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  PENDING = "pending",
  PAYMENT_FAILED = "payment_failed",
  CANCELED = "canceled",
  AUTO_CANCELED = "canceled_due_to_failed_payments",
}
