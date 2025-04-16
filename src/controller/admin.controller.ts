import AdminModel from '../models/admin.model'
import appAssert from '../utils/appAssert'
import { NOT_FOUND, OK } from '../constants/http'
import catchErrors from '../utils/catchErrors'
import cloudinary from 'cloudinary'
import { hashValue } from '../utils/bcrypt'
import UserModel from '../models/user.model'
import QuizModel from '../models/quiz.model'

export const getAdminHandler = catchErrors(async (req, res) => {
  const admin = await AdminModel.findById(req.userId)
  appAssert(admin, NOT_FOUND, 'Organisation not found')
  return res.status(OK).json(admin.omitPassword())
})

export const updateAdmin = catchErrors(async (req, res) => {
  const { name, email, password, ...restData } = req.body

  const admin = await AdminModel.findById(req.userId)
  appAssert(admin, NOT_FOUND, 'Admin not found')

  let imageInfo = admin.imageInfo

  if (req.file) {
    if (imageInfo?.imageId) {
      await cloudinary.v2.uploader.destroy(imageInfo.imageId)
    }

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'admin',
    })

    imageInfo = {
      imageUrl: result.secure_url,
      imageId: result.public_id,
    }
  }

  const updateFields: Partial<typeof admin> = {
    name,
    email,
    ...restData,
    ...(imageInfo && { imageInfo }),
  }

  if (password) {
    updateFields.password = await hashValue(password)
  }

  const updatedAdmin = await AdminModel.findOneAndUpdate(
    { _id: req.userId },
    updateFields,
    { new: true, runValidators: true }
  )

  appAssert(updatedAdmin, NOT_FOUND, 'Admin not found')

  return res.status(200).json({ admin: updatedAdmin })
})

export const getAllAdmins = catchErrors(async (req, res) => {
  const chiefAdmin = await AdminModel.findOne({
    role: 'chief_admin',
    _id: req.userId
  })

  if (!chiefAdmin) {
    return res.status(403).json({ message: 'Access denied' })
  }
  
  const admins = await AdminModel.find({}).select('-password')
  res.json(admins)
})


export const deleteAdmin = catchErrors(async (req, res) => {
  const { id } = req.params
   const chiefAdmin = await AdminModel.findOne({
     role: 'chief_admin',
     _id: req.userId,
   })

   if (!chiefAdmin) {
     return res.status(403).json({ message: 'Access denied' })
   }

   if (chiefAdmin._id == req.params.id) {
    return res.status(403).json({ message: 'Cannot delete chief admin'})
   }
  const admin = await AdminModel.findByIdAndDelete(id)
  appAssert(admin, NOT_FOUND, 'The admin does not exist')
  res.status(200).json({ message: 'admin deleted successfully' })
})



export const getAdminStats = catchErrors(async (req, res) => {
  const totalUsers = await UserModel.countDocuments()
    const newUsersThisMonth = await UserModel.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    })

    const totalQuizzes = await QuizModel.countDocuments()
    const newQuizzesThisMonth = await QuizModel.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    })

    const totalAdmins = await AdminModel.countDocuments({})

    // User registration data for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)

    const userRegistrations = await UserModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const formattedRegistrations = userRegistrations.map((entry) => ({
      month: entry._id,
      count: entry.count
    }))

    res.json({
      totalUsers,
      newUsersThisMonth,
      totalQuizzes,
      newQuizzesThisMonth,
      totalAdmins,
      userRegistrations: formattedRegistrations
})
})

