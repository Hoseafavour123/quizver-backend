import Quiz from '../models/quiz.model'
import { v2 as cloudinary } from 'cloudinary'
import { quizSchema } from './quiz.schema'
import catchErrors from '../utils/catchErrors'
import appAssert from '../utils/appAssert'
import { getSocket } from '../sockets/socket'
import CompletedQuiz from '../models/completedQuiz'
import UserModel from '../models/user.model'
import mongoose from 'mongoose'
import { sendMail } from '../utils/sendMail'
import QuizModel from '../models/quiz.model'
import { getNewQuizNotificationTemplate, getQuizNowLiveTemplate } from '../utils/emailTemplates'
import { Notification } from '../models/notification.model'


export const getQuiz = catchErrors(async (req, res) => {
  const { id } = req.params
  const quiz = await Quiz.findById(id)
  appAssert(quiz, 404, 'Quiz not found')
  return res.json(quiz)
})

export const getLatestQuiz = catchErrors(async (req, res) => {
  const [latestQuiz] = await CompletedQuiz.find()
    .sort({ completedAt: -1 })
    .limit(1)

  if (!latestQuiz) {
    return res.status(404).json({ message: 'No completed quizzes found.' })
  }

  const quiz = await Quiz.findById(latestQuiz.quizId)


  const quizId = latestQuiz.quizId

  const participants = await CompletedQuiz.find({ quizId })
    .sort({ score: -1 })
    .populate('userId', 'firstName lastName email imageInfo')
    .populate('quizId', 'title')

  const leaderboard = participants.map((p) => {
    const user = p.userId as unknown as {
      _id: string
      firstName: string
      lastName: string
      email: string
      imageInfo: {
        imageUrl: string,
        imageId: string
      }
    }

    return {
      id: p._id,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      score: p.score,
      rewarded: p.rewarded ?? false,
      imageUrl: user.imageInfo.imageUrl
    }
  })


  const totalParticipants = participants.length

  const quizTitle = quiz?.title || 'Sample Quiz'

  res.json({
    quizId,
    quizTitle,
    leaderboard,
    totalParticipants,
    paymentsDistributed: latestQuiz.paymentsDistributed,
  })
})


export const getAllQuizzes = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = 5

  const totalQuizzes = await Quiz.countDocuments()
  const quizzes = await Quiz.find()
    .sort({ createdAt: -1 }) // Latest first
    .skip((page - 1) * limit)
    .limit(limit)

  res.json({
    quizzes,
    currentPage: page,
    totalPages: Math.ceil(totalQuizzes / limit),
    totalQuizzes,
  })
})


export const isQuizCompleted = catchErrors(async (req, res) => {
  const { quizId } = req.params

  const quiz = CompletedQuiz.findOne({ userId: req.userId, quizId })
  
  if (!quiz) {
    return res.json({ isCompleted: false })
  }
  return res.json({ isCompleted: true })
})


export const getCompletedQuizzesAnswers = catchErrors(async (req, res) => {

  const completedQuiz = await CompletedQuiz.findOne({_id:req.params.quizId, userId:req.userId})
  appAssert(completedQuiz, 404, 'Completed quiz not found')


  if (!completedQuiz)
    return res.status(404).json({ error: 'Completed quiz not found' })

  const quiz = await Quiz.findById(completedQuiz.quizId)

  if (!quiz) return res.status(404).json({ error: 'Quiz not found' })

  return res.json({
    completedQuiz,
    quiz: {
      title: quiz.title,
      questions: quiz.questions,
    },
  })
})

export const getCompletedQuizzes = catchErrors(async (req, res) => {
  const page = parseInt((req.query.page as string) || '1')
  const limit = 10
  const skip = (page - 1) * limit
  
  const quizzes = await CompletedQuiz.find({ userId: req.userId })
    .populate('quizId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  appAssert(quizzes.length > 0, 404, 'No quizzes found')

  return res.json({ quizzes, currentPage: page })
})


export const createQuiz = catchErrors(async (req, res) => {
  const parsedData = quizSchema.safeParse(req.body)
  if (!parsedData.success) {
    console.log(parsedData.error.errors)
    return res
      .status(400)
      .json({ message: 'Invalid input', errors: parsedData.error.errors })
  }

  const { title, description, duration, questions, category } = parsedData.data
  const files = (req.files as Express.Multer.File[]) || []

  // Function to upload an image buffer to Cloudinary
  const uploadToCloudinary = (file: Express.Multer.File) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'quiz_images' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result?.secure_url)
        }
      )
      uploadStream.end(file.buffer) // Send buffer to Cloudinary
    })
  }

  // Upload images & create processed questions
  const processedQuestions = await Promise.all(
    questions.map(async (q, index) => {
      let imageUrl = null

      if (files[index]) {
        try {
          imageUrl = (await uploadToCloudinary(files[index])) as string
        } catch (error) {
          console.error('Cloudinary Upload Error:', error)
          return res.status(500).json({ message: 'Image upload failed' })
        }
      }

      return {
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer.toUpperCase(),
        image: imageUrl, // Store Cloudinary URL
      }
    })
  )

  const newQuiz = new Quiz({
    title,
    description,
    duration,
    category,
    questions: processedQuestions,
  })

  await newQuiz.save()

  
  res.status(201).json({ message: 'Quiz created successfully!' })
})


export const updateQuiz = catchErrors(async (req, res) => {
  const { id } = req.params
  const parsedData = quizSchema.safeParse(req.body)

  if (!parsedData.success) {
    console.log(parsedData.error.errors)
    return res
      .status(400)
      .json({ message: 'Invalid input', errors: parsedData.error.errors })
  }

  const { title, description, duration, questions } = parsedData.data
  const files = (req.files as Express.Multer.File[]) || []

  const quiz = await Quiz.findById(id)
  appAssert(quiz, 404, 'Quiz not found')

  const uploadToCloudinary = async (file: Express.Multer.File) => {
    try {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'quiz_images' },
          (error, result) => {
            if (error) return reject(error)
            resolve(result?.secure_url as string)
          }
        )
        uploadStream.end(file.buffer) // Send file buffer to Cloudinary
      })
    } catch (error) {
      console.error('Cloudinary Upload Error:', error)
      throw new Error('Image upload failed')
    }
  }

  const processedQuestions = await Promise.all(
    questions.map(async (q, index) => {
      let imageUrl = q.image || null // Preserve old image if no new one

      // Check if a new image was uploaded for this question
      const file = files.find(
        (f) => f.fieldname === `questions[${index}][image]`
      )

      if (file) {
        try {
          imageUrl = await uploadToCloudinary(file) // Upload new image
        } catch (error) {
          console.error(`Image upload failed for question ${index}:`, error)
          return res
            .status(500)
            .json({ message: `Image upload failed for question ${index}` })
        }
      }

      console.log(q)

      return {
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer.toUpperCase(),
        image: imageUrl, // Store Cloudinary URL
      }
    })
  )

  // // Process questions (handle new images, retain old ones)
  // const processedQuestions = await Promise.all(
  //   questions.map(async (q, index) => {
  //     let imageUrl = q.image // Keep old image if no new one is uploaded

  //     if (files[index]) {
  //       // Upload new image to Cloudinary
  //       const result = await cloudinary.uploader.upload(files[index].path)
  //       imageUrl = result.secure_url

  //       // Delete old image from Cloudinary if it exists
  //       if (q.image) {
  //         const publicId = q.image.split('/').pop()?.split('.')[0]
  //         await cloudinary.uploader.destroy(publicId as string)
  //       }
  //     }

  //     return {
  //       text: q.text,
  //       options: q.options,
  //       correctAnswer: q.correctAnswer.toUpperCase(),
  //       image: imageUrl,
  //     }
  //   })
  // )

  // Update quiz in DB
  await Quiz.findByIdAndUpdate(id, {
    title,
    description,
    duration,
    questions: processedQuestions,
  })

  return res.status(200).json({ message: 'Quiz updated successfully!' })
})


export const deleteQuiz = catchErrors(async (req, res) => {
  const { id } = req.params
  const quiz = await Quiz.findById(id)
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' })

  // Delete images from Cloudinary
  const deleteImagePromises = quiz.questions
    .filter((q) => q.image)
    .map((q) => {
      const publicId = (q.image as string).split('/').pop()?.split('.')[0] // Extract Cloudinary ID
      return cloudinary.uploader.destroy(publicId as string)
    })

  await Promise.all(deleteImagePromises)
  await Quiz.findByIdAndDelete(id)

  return res.status(200).json({ message: 'Quiz deleted successfully!' })
})

export const submitQuiz = catchErrors(async (req, res) => {
  const { quizId, answers, score, totalQuestions } = req.body

  // Validate required fields
  if (!quizId || !answers || score === undefined || !totalQuestions) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Check if quiz exists
  const quizExists = await Quiz.findById(quizId)
  if (!quizExists) {
    return res.status(404).json({ message: 'Quiz not found' })
  }

  // Create and save the completed quiz
  const completedQuiz = new CompletedQuiz({
    userId: req.userId,
    quizId: quizExists._id,
    answers,
    score,
    totalQuestions,
  })

  await completedQuiz.save()

  res
    .status(201)
    .json({ message: 'Quiz submitted successfully', completedQuiz })
})

export const goLive = catchErrors(async (req, res) => {
  const { id } = req.params
  const quiz = await Quiz.findById(id)

  if (!quiz) return res.status(404).json({ message: 'Quiz not found' })

  const liveQuiz = await Quiz.findOne({ status: 'live' })
  if (liveQuiz)
    return res.status(400).json({ message: 'A quiz is already live' })

  quiz.status = 'live'
  quiz.startTime = new Date()
  await quiz.save()

  const io = getSocket() // ✅ Get the io instance
  io.emit('quiz-live', quiz) // Notify users in real-time

  setTimeout(async () => {
    quiz.status = 'closed'
    await quiz.save()
    io.emit('quiz-ended', { quizId: quiz._id })
  }, quiz.duration * 60 * 1000) // Auto-close after duration

  return res.json({ message: 'Quiz is live!' })
})


export const getScheduledQuiz = catchErrors(async (req, res) => {
  const scheduledQuiz = await Quiz.findOne({ status: 'scheduled' })

  if (!scheduledQuiz) return res.status(400).json({ message: 'No scheduled quiz' })
  return res.json(scheduledQuiz)
})

export const getLiveQuiz = catchErrors(async (req, res) => {
  const liveQuiz = await Quiz.findOne({ status: 'live' })

  if (!liveQuiz) return res.status(400).json({ message: 'No live quiz' })
  return res.json(liveQuiz)
})

export const getLeaderboardData = catchErrors(async (req, res) => {
  const filter = req.query.filter || 'all' // Default to all-time
  const now = new Date()
  let dateFilter = {}

  if (filter === 'weekly') {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    dateFilter = { createdAt: { $gte: startOfWeek } }
  } else if (filter === 'monthly') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    dateFilter = { createdAt: { $gte: startOfMonth } }
  }

  // Aggregate user scores based on filter
  const leaderboard = await CompletedQuiz.aggregate([
    { $match: dateFilter }, // Apply date filter if provided
    {
      $group: {
        _id: '$userId',
        totalScore: { $sum: '$score' },
      },
    },
    { $sort: { totalScore: -1 } }, // Sort descending
    { $limit: 10 }, // Top 10 users
  ])

  // Populate user details
  const userIds = leaderboard.map((entry) => entry._id)
  const users: {
    _id: mongoose.Types.ObjectId
    firstName: string
    lastName: string
    imageUrl?: string
    email?: string
  }[] = await UserModel.find({ _id: { $in: userIds } }).select(
    'firstName lastName imageUrl email'
  )

  // Merge user data with leaderboard scores
  const leaderboardData = leaderboard.map((entry) => {
    const user = users.find((u) => u._id.toString() === entry._id.toString())
    return {
      id: entry._id,
      name: user ? `${user.firstName}` : 'Unknown User', // ✅ Fix
      imageUrl: user?.imageUrl || '',
      email: user?.email,
      score: entry.totalScore,
    }
  })

  res.json(leaderboardData)
})


export const scheduleQuiz = catchErrors(async (req, res) => {
  const { quizId } = req.params
  const { hours } = req.body

  appAssert(quizId, 400, 'Quiz ID is required')
  appAssert(hours, 400, 'Hours until start is required')

  const currentLive = await Quiz.findOne({ status: 'scheduled'})
  const currentScheduled = await Quiz.findOne({ status: 'live'})

  if (currentLive || currentScheduled) {
    return res.status(400).json({ message: 'A quiz is already scheduled or live' })
  }
  const quiz = await Quiz.findById(quizId)
  appAssert(quiz, 404, 'Quiz not found')

  quiz.status = 'scheduled'
 
  quiz.scheduledAt = new Date(Date.now() + hours * 60 * 60 * 1000)
  await quiz.save()

  const notification = new Notification({
    type: 'update',
    title: 'A new quiz is scheduled!',
    message: 'A new quiz will go live soon, you must have a Payment profile to receive payments, go to the Payment Profile section to create one',

  })

  await notification.save()

  const users = await UserModel.find({})

  const quizPaymentUrl = `https://quizver.vercel.app/user/quiz/pay/${quizId}`
  //const quizPaymentUrl = `http://localhost:5173/user/quiz/pay/${quizId}`



  await Promise.all(
    users.map((user) =>
      sendMail({
        email: user.email,
        ...getNewQuizNotificationTemplate(
          quiz?.title || 'New Quiz',
          quizPaymentUrl,
          hours
        ),
      })
    )
  )

  await QuizModel.findOneAndUpdate({ _id: quizId }, { notificationSent: true })

  setTimeout(async () => {
    const updatedQuiz = await Quiz.findById(quizId)
    appAssert(updatedQuiz, 404, 'Quiz not found')

    updatedQuiz.status = 'live'
    await updatedQuiz.save()

     const notification = new Notification({
       type: 'update',
       title: `${updatedQuiz.title} is live!`,
       message:
         "Dont miss the opportunity to earn from this quiz!",
     })

     await notification.save()


   //const quizUrl = `http://localhost:5173/user/live-quiz?quizId=${quizId}`;

    const quizUrl = `https://quizver.vercel.app/user/live-quiz?quizId=${quizId}`

    await Promise.all(
      users.map((user) =>
        sendMail({
          email: user.email,
          ...getQuizNowLiveTemplate(quiz?.title || 'Live Quiz', quizUrl),
        })
      )
    )

    const io = getSocket()

    io.emit('quiz-live', { quizId })
    console.log(`Quiz ${quizId} is now live.`)

    setTimeout(async () => {
      const liveQuiz = await Quiz.findById(quizId)
      appAssert(liveQuiz, 404, 'Quiz not found')

      liveQuiz.status = 'closed'
      await liveQuiz.save()

      io.emit('quiz-ended', { quizId })
      console.log(`Quiz ${quizId} has ended.`)
    }, updatedQuiz.duration * 60 * 1000)
  }, hours * 60 * 60 * 1000)

  return res.status(200).json({ message: 'Quiz scheduled successfully', quiz })
})
