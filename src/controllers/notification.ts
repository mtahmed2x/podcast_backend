// import Notification from "@models/notification";
// import { Types } from "mongoose";
// import Podcast from "@models/podcast";
// import User from "@models/user";
// import { NotificationSchema } from "@schemas/notification";
// import { Subject } from "@shared/enums";
// import to from "await-to-ts";

// const setNotificationMessage = async (
//     subject: Subject,
//     userIds: Types.ObjectId[],
//     pod
// ): Promise<String> => {
//     const length = userIds.length;
//     let message;
//     if(subject === Subject.LIKE) {
//         const action = "liked";
//         if (length === 1) {
//             let user = await User.findById(userIds[0]);
//             message = `${user!.name} ${action} your podcast ${title}`;
//         } else if (length === 2) {
//             let user1 = await User.findById(notification.users[0]);
//             let user2 = await User.findById(notification.users[1]);
//             message = `${user1!.name} and ${user2!.name} ${action} your podcast ${title}`;
//         } else {
//             let user1 = await User.findById(notification.users[0]);
//             let user2 = await User.findById(notification.users[1]);
//             message = `${user1!.name}, ${user2!.name} and ${length - 2} others ${action} your podcast ${title}`;
//         }
//         if (action === "added") message = message + "to Favorites";
//     }

//     return message;
// };

// const addNotification = async (
//     subject: Subject,
//     recipient: Types.ObjectId,
//     podcast?: Types.ObjectId,
//     userId?: Types.ObjectId,
// ) => {
//     if (subject === Subject.LIKE) {
//         let error, notification;
//         [error, notification] = await to(
//             Notification.findOne({ subject: subject, recipient: recipient, podcast: podcast }),
//         );
//         if (error) throw error;
//         if (notification && userId && podcast) {
//             if(!notification.metadata?.userIds?.includes(userId)) {
//                 notification.metadata?.userIds?.push(userId);
//                 await notification.save();
//             }
//         }
//     }
// };
