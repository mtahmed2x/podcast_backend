export enum Role {
    USER = "USER",
    CREATOR = "CREATOR",
    ADMIN = "ADMIN",
}

export enum Subject {
    LIKE = "LIKE",
    COMMENT = "COMMENT",
    SUBSCRIPTION = "SUBSCRIPTION",
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
