import { Router } from "express";
import { createQuiz, deleteQuiz, getAllQuizzes, getCompletedQuizzes, getCompletedQuizzesAnswers, getLatestQuiz, getLeaderboardData, getLiveQuiz, getQuiz,  getScheduledQuiz,  goLive,  isQuizCompleted,  scheduleQuiz,  submitQuiz,  updateQuiz } from "../controller/quiz.controller";
import { uploadMiddleware } from "../middleware/uploadMiddleware";

const router = Router()


router.get('/completed-quiz-answers/:quizId', getCompletedQuizzesAnswers)
router.get('/latest-leaderboard', getLatestQuiz)
router.get('/check-completed/:id', isQuizCompleted)
router.get('/get-live-quiz', getLiveQuiz)
router.get('/scheduled-quiz', getScheduledQuiz)
router.get('/completed-quizzes', getCompletedQuizzes)
router.get('/leaderboard', getLeaderboardData)
router.post('/submit', submitQuiz)
router.post('/schedule/:quizId', scheduleQuiz)
router.post("/", uploadMiddleware, createQuiz)
router.delete("/:id", deleteQuiz)

router.get('/', getAllQuizzes)
router.get('/:id', getQuiz)
router.put('/:id', uploadMiddleware, updateQuiz)
router.put('/go-live/:id', goLive)
export default router