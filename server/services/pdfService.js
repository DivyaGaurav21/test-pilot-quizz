const PDFDocument = require('pdfkit');

// Generates a result PDF and streams it directly to the response.
// result: a Result document, with examId populated (title, subject, etc.)
// user: the requesting user (for displaying name/email on the PDF)
const generateResultPdf = (result, user, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=result-${result._id}.pdf`
  );

  doc.pipe(res);

  doc
    .fontSize(20)
    .text('Exam Result', { align: 'center' })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Candidate: ${user.name}`)
    .text(`Email: ${user.email}`)
    .moveDown();

  const exam = result.examId || {};

  doc
    .fontSize(14)
    .text('Score Summary', { underline: true })
    .fontSize(12)
    .text(`Score: ${result.score} / ${result.totalMarks}`)
    .text(`Percentage: ${result.percentage}%`)
    .text(`Correct Answers: ${result.correctAnswers}`)
    .text(`Wrong Answers: ${result.wrongAnswers}`)
    .text(`Unanswered: ${result.unanswered}`)
    .text(`Time Taken: ${Math.round(result.timeTaken / 60)} min`)
    .text(`Submitted At: ${new Date(result.submittedAt).toLocaleString()}`)
    .moveDown();

  doc.end();
};

module.exports = { generateResultPdf };