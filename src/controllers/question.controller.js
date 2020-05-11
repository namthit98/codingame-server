const QuestionModel = require("../models/Question");

const createQuestion = async (req, res, next) => {
  const { title, difficult, description, language, coding, testing } = req.body;

  if (
    !title ||
    !difficult ||
    !description ||
    !language ||
    !coding ||
    !testing
  ) {
    return res.status(400).jsonp({
      success: false,
      message: "Data is valid",
    });
  }

  const question = new QuestionModel({
    code: "Q" + Math.floor(Math.random() * (10000 - 1 + 1) + 1),
    title,
    difficult,
    description,
    language,
    coding,
    testing,
    owner: req.user._id,
  });

  await question.save();

  res.jsonp({
    success: true,
    data: question,
    message: "Create question successfully!",
  });
};

const listQuestions = async (req, res, next) => {
  const { status } = req.query;

  const query = QuestionModel.find({});

  if (parseInt(status) === 0 || parseInt(status) === 1) {
    query.where({
      isAccepted: parseInt(status) === 0 ? false : true,
    });
  }

  const questions = await query.populate("owner").sort('-status -createdAt').exec();

  res.jsonp({
    success: true,
    data: questions,
    message: "Get questions successfully !",
  });
};

const updateStatus = async (req, res, next) => {
  const { questionId } = req.params;

  const question = await QuestionModel.findOne({ _id: questionId });

  question.isAccepted = !question.isAccepted;

  await question.save();

  res.status(200).json({
    success: true,
    results: {
      isAccepted: question.isAccepted,
    },
    message: "Change status successfully!",
  });
};

const getQuestion = async (req, res, next) => {
  const { questionId } = req.params;

  const question = await QuestionModel.findOne({ _id: questionId });

  res.status(200).json({
    success: true,
    results: question,
    message: "Get question successfully!",
  });
};

module.exports = {
  createQuestion,
  listQuestions,
  updateStatus,
  getQuestion,
};
