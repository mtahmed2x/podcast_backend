// import Notification from "@models/notification";
// import { Types } from "mongoose";
// import Podcast from "@models/podcast";
// import User from "@models/user";
// import { NotificationSchema } from "@schemas/notification";
// import { Subject } from "@shared/enums";

// const setNotificationMessage = async (
//     notification: NotificationSchema,
//     length: number,
//     action: string,
//     title: string,
// ) => {
//     let message;
//     if (length === 1) {
//         let user = await User.findById(notification.users[0]);
//         message = `${user!.name} ${action} your podcast ${title}`;
//     } else if (length === 2) {
//         let user1 = await User.findById(notification.users[0]);
//         let user2 = await User.findById(notification.users[1]);
//         message = `${user1!.name} and ${user2!.name} ${action} your podcast ${title}`;
//     } else {
//         let user1 = await User.findById(notification.users[0]);
//         let user2 = await User.findById(notification.users[1]);
//         message = `${user1!.name}, ${user2!.name} and ${length - 2} others ${action} your podcast ${title}`;
//     }
//     if (action === "added") message = message + "to Favorites";
//     return message;
// };

// export const addNotification = async (id: string, userId: string, subject: string) => {
//     const podcast = await Podcast.findById(id);

//     let notification = await Notification.findOne({
//         subject: subject,
//         podcast: id,
//     });
//     if (!notification) {
//         notification = await Notification.create({
//             subject: subject,
//             users: userId,
//             podcast: id,
//             creator: podcast!.creator,
//         });
//     } else {
//         if (!notification.users.includes(new Types.ObjectId(userId))) {
//             notification.users.push(new Types.ObjectId(userId));
//         }
//     }
//     let action: string = "";
//     if (subject === Subject.LIKE) action = "liked";
//     else if (subject === Subject.COMMENT) action = "commented on";
//     else if (subject === Subject.PLAYLIST) action = "added";

//     notification.message = await setNotificationMessage(
//         notification,
//         notification.users.length,
//         action,
//         podcast!.title,
//     );
//     await notification.save();
//     console.log(notification);
// };

// export const removeLikeNotification = async (id: string, userId: string) => {
//     const podcast = await Podcast.findById(id);
//     let notification = await Notification.findOne({
//         subject: "like",
//         podcast: id,
//     });
//     const notificationId = notification!._id;
//     if (notification!.users.length === 1) {
//         await Notification.findByIdAndDelete(notificationId);
//     } else {
//         notification = await Notification.findByIdAndUpdate(
//             notificationId,
//             { $pull: { users: userId } },
//             { new: true },
//         );
//         notification!.message = await setNotificationMessage(
//             notification!,
//             notification!.users.length,
//             "liked",
//             podcast!.title,
//         );
//         await notification!.save();
//         console.log(notification);
//     }
// };
