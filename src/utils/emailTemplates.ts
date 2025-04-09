export const getPasswordResetTemplate = (url: string) => ({
  subject: "Password Reset Request",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Reset Password Email Template</title><meta name="description" content="Reset Password Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your password</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset Password</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});

export const getVerifyEmailTemplate = (url: string) => ({
  subject: "Verify Email Address",
  text: `Click on the link to verify your email address: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Verify Email Address Email Template</title><meta name="description" content="Verify Email Address Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Please verify your email address</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Click on the following link to verify your email address.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email Address</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});



export const getNewQuizNotificationTemplate = (quizTitle: string, registerUrl: string, hours: number) => ({
  subject: `🚀 New Quiz Alert: ${quizTitle}!`,
  text: `A new quiz "${quizTitle}" is now available! Click the link below to register and participate:\n${registerUrl}`,
  html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Quiz Available</title>
    <style>
      body { font-family: 'Arial', sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
      .header { background: #0073e6; color: #ffffff; text-align: center; padding: 20px 10px; font-size: 22px; font-weight: bold; }
      .content { padding: 30px; text-align: center; color: #333; }
      .content h2 { color: #0073e6; font-size: 24px; margin-bottom: 20px; }
      .content p { font-size: 16px; line-height: 1.6; }
      .button { display: inline-block; background: #0073e6; color: #ffffff; padding: 12px 25px; font-size: 18px; font-weight: bold; border-radius: 5px; text-decoration: none; margin-top: 20px; }
      .button:hover { background: #005bb5; }
      .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🎉 New Quiz Alert!</div>
      <div class="content">
        <h2>${quizTitle}</h2>
        <strong>Will go live in ${hours} hour(s)! </strong>
        <p>Think you have what it takes? Test your knowledge with our latest quiz! Click the button below to register.</p>
        <a href="${registerUrl}" class="button">Register Now</a>
      </div>
      <div class="footer">© ${new Date().getFullYear()} Quizver | All rights reserved</div>
    </div>
  </body>
  </html>`,
});


export const getQuizNowLiveTemplate = (
  quizTitle: string,
  startUrl: string
) => ({
  subject: `🟢 Quiz Now Live: ${quizTitle}`,
  text: `The quiz "${quizTitle}" is now live! Click below to start immediately:\n${startUrl}`,
  html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Now Live</title>
    <style>
      body { font-family: 'Arial', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .header { background: #28a745; color: #ffffff; text-align: center; padding: 20px 10px; font-size: 22px; font-weight: bold; }
      .content { padding: 30px; text-align: center; color: #333333; }
      .content h2 { color: #28a745; font-size: 24px; margin-bottom: 20px; }
      .content p { font-size: 16px; line-height: 1.6; }
      .button { display: inline-block; background: #28a745; color: #ffffff; padding: 12px 25px; font-size: 18px; font-weight: bold; border-radius: 5px; text-decoration: none; margin-top: 20px; }
      .button:hover { background: #218838; }
      .footer { text-align: center; padding: 20px; font-size: 14px; color: #666666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🔥 The Quiz Has Started!</div>
      <div class="content">
        <h2>${quizTitle}</h2>
        <p>It's time! The quiz you registered for is now live. Don't miss your chance to participate and prove your skills.</p>
        <a href="${startUrl}" class="button">Start Quiz</a>
      </div>
      <div class="footer">© ${new Date().getFullYear()} Quizver | All rights reserved</div>
    </div>
  </body>
  </html>`,
})
