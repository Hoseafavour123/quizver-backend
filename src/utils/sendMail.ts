import nodemailer from 'nodemailer'

type OptionType = {
  email: string | undefined
  subject: string
  html: string
  attachments?: [
    {
      filename: string
      path: string
    }
  ]
}

type MailOptionType = {
  from: string
  to: string | undefined
  subject: string
  html: string
  attachments?: [
    {
      filename: string
      path: string
    }
  ]
}

export const sendMail = async (options: OptionType) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  } as any)

  const mailOptions: MailOptionType = {
    from: `"Quizver" <hoseafavour123@gmail.com>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  }
  if (options.attachments && options.attachments[0]) {
    mailOptions.attachments = [
      {
        filename:
          options && options.attachments && options.attachments[0].filename,
        path: options && options.attachments && options.attachments[0].path,
      },
    ]
  }
  await transporter.sendMail(mailOptions)
}