import UserModel from '../models/user.model'
import appAssert from '../utils/appAssert'
import { NOT_FOUND, OK } from '../constants/http'
import catchErrors from '../utils/catchErrors'
import cloudinary from 'cloudinary'
import { hashValue } from '../utils/bcrypt'
import mongoose from 'mongoose'
import { Response } from 'express'
import CompletedQuiz from '../models/completedQuiz'


export const getUserHandler = catchErrors(async (req, res) => {
  const user = await UserModel.findById(req.userId)
  appAssert(user, NOT_FOUND, 'User not found')
  return res.status(OK).json(user.omitPassword())
})

// Delete a user
export const deleteUser = catchErrors(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findByIdAndDelete(id);
  await CompletedQuiz.deleteMany({ userId: id });
  if (user?.imageInfo?.imageId) {
    await cloudinary.v2.uploader.destroy(user.imageInfo.imageId);
  }
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ message: 'User deleted successfully' });
});

// Update a user
export const updateUser = catchErrors(
  async (req, res) => {
    const { firstName, lastName, password, email, ...restData } = req.body

    const user = await UserModel.findById(req.userId)
    appAssert(user, NOT_FOUND, 'User not found')

    let imageInfo = user.imageInfo

    if (req.file) {
      if (imageInfo?.imageId) {
        await cloudinary.v2.uploader.destroy(imageInfo.imageId)
      }
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'users',
      })

      imageInfo = {
        imageUrl: result.secure_url,
        imageId: result.public_id,
      }
    }

    const updateFields: Partial<typeof user> = {
      firstName,
      lastName,
      email,
      ...restData,
      ...(imageInfo && { imageInfo }), 
    }
    

    if (password) {
    updateFields.password = await hashValue(password);
  }


    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.userId },
      updateFields,
      { new: true, runValidators: true }
    )

    appAssert(updatedUser, NOT_FOUND, 'User not found')

    return res.status(200).json({ volunteer: updatedUser })
  }
)



export const getAllUsers = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find().skip(skip).limit(limit),
    UserModel.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    users,
    currentPage: page,
    totalPages,
    totalUsers: total,
  });
});



interface UserStatsResponse {
  highestScore: number
  totalQuizzesTaken: number
  userRank: number | null
  formattedStats: { day: string; score: number; quizzes: number }[]
}

export const getStats = catchErrors(
  async (req, res: Response<UserStatsResponse>) => {
    const userId = req.userId

    appAssert(userId, 400, 'User ID is required')

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' } as any)
    }

    // Determine time filter
    const { filter = 'weekly' } = req.query
    const today = new Date()
    let startDate

    if (filter === 'weekly') {
      startDate = new Date(today.setDate(today.getDate() - today.getDay())) // Start of the current week (Sunday)
    } else if (filter === 'daily') {
      startDate = new Date(today.setHours(0, 0, 0, 0)) // Start of today
    } else if (filter === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1) // Start of the current month
    } else {
      return res.status(400).json({ message: 'Invalid filter type' } as any)
    }

    //all time
    const allTimeStats = await CompletedQuiz.find({ userId })

    // Fetch user quiz stats within the time frame
    // const userStats = await CompletedQuiz.find({
    //   userId,
    //   createdAt: { $gte: startDate },
    // })

    appAssert(allTimeStats.length, 400, 'No quizzes found for this time frame')

    const highestScore = Math.max(...allTimeStats.map((q) => q.score), 0)
    const totalQuizzesTaken = allTimeStats.length

    // Fetch leaderboard rankings
    const allScores = await CompletedQuiz.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
        },
      },
      { $sort: { totalScore: -1 } },
    ])

    // Get user rank
    const userIndex = allScores.findIndex(
      (user) => user._id.toString() === userId
    )
    const userRank = userIndex !== -1 ? userIndex + 1 : null

    // Aggregate scores by day of the week
    const weeklyStats = await CompletedQuiz.aggregate([
      {
        $match: { userId, createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          totalScore: { $sum: '$score' },
          quizzesTaken: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Format weekly scores
    const formattedStats = Array(7)
      .fill(0)
      .map((_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        score: weeklyStats.find((s) => s._id === i + 1)?.totalScore || 0,
        quizzes: weeklyStats.find((s) => s._id === i + 1)?.quizzesTaken || 0,
      }))

    return res.json({
      highestScore,
      totalQuizzesTaken,
      userRank,
      formattedStats,
    })
  }
)
