
import { Notification } from '../models/notification.model'
import UserModel from '../models/user.model'
import catchErrors from '../utils/catchErrors'


export const getNotifications = catchErrors(async (req, res) => {
  const { userId } = req.params

 
  const user = await UserModel.findById(userId).select('createdAt')
  if (!user) return res.status(404).json({ message: 'User not found' })

  const notifications = await Notification.find({
    createdAt: { $gt: user.createdAt },
    $or: [
      { userId: userId }, 
      { userId: { $exists: false } }, 
    ],
  })
    .sort({ createdAt: -1 })
    .lean()

  res.json(notifications)
})


export const markAsRead = catchErrors(async (req, res) => {
  const userId = req.params.userId // Correct way to access `userId` from URL

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' })
  }

  // Mark all unread notifications for this user as read by adding userId to readBy
  await Notification.updateMany(
    {
      readBy: { $ne: userId }, // user hasn't read it yet
      $or: [
        { userId: userId }, // personal notification
        { userId: { $exists: false } }, // general notification
      ],
    },
    {
      $addToSet: { readBy: userId }, // add to readBy if not already there
    }
  )

  res.json({ success: true })
})
