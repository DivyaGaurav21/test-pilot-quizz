// export function calculateResult(questions, answers = {}) {
//   let correctAnswers = 0;

//   questions.forEach((question, index) => {
//     const selected = Number(answers[index]);
//     if (selected === question.correctAnswer) {
//       correctAnswers += 1;
//     }
//   });

//   const totalQuestions = questions.length;
//   const score = totalQuestions
//     ? Math.round((correctAnswers / totalQuestions) * 100)
//     : 0;

//   return { correctAnswers, totalQuestions, score };
// }


// Calculates the result from submitted answers and the exam's questions.
//
// questions: array of Question documents (must include _id, correctAnswer, marks)
// submittedAnswers: object mapping questionId (string) -> selected option (string)
// timeTaken: number of seconds the user spent on the exam
//
// Returns an object matching the Result model's scoring fields.


const calculateResult = (questions, submittedAnswers, timeTaken) => {
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unanswered = 0;
  let score = 0;
  let totalMarks = 0;

  questions.forEach((q) => {
    const questionId = q._id.toString();
    const marks = q.marks || 1;
    totalMarks += marks;

    const submitted = submittedAnswers ? submittedAnswers[questionId] : undefined;

    if (submitted === undefined || submitted === null || submitted === '') {
      unanswered += 1;
      return;
    }

    if (submitted === q.correctAnswer) {
      correctAnswers += 1;
      score += marks;
    } else {
      wrongAnswers += 1;
    }
  });

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  return {
    score,
    totalMarks,
    correctAnswers,
    wrongAnswers,
    unanswered,
    percentage: Math.round(percentage * 100) / 100,
    timeTaken,
  };
};

module.exports = calculateResult;