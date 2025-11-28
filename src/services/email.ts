import path from "path";
import { promisify } from "util";
import nodemailer from "nodemailer";
import twig from "twig";

type Template = {
  name: string;
  data: {
    email: string;
    url: string;
  };
};

type sendEmailDataType = {
  to: string;
  subject: string;
  text?: string;
  template: Template;
};

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  text?: string | undefined;
  html?: string | undefined;
};

export default class EmailService {
  send = async ({ to, subject, text, template }: sendEmailDataType) => {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: process.env.MAIL_PROTOCOL === "SSL",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions: MailOptions = {
      from: process.env.MAIL_USER!,
      to,
      subject,
      text,
    };

    if (template) {
      const templatePath = path.join(
        __dirname,
        "../templates",
        `${template.name}.twig`
      );

      mailOptions.html = await new Promise((resolve, reject) => {
        twig.renderFile(templatePath, template.data, (err, html) => {
          if (err) return reject(err);
          resolve(html);
        });
      });
    }
    await promisify(transporter.sendMail.bind(transporter))(mailOptions);
  };

  sendEmailVerification = async (email: string, token: string) => {
    await this.send({
      to: email,
      subject: "Email Verification",
      template: {
        name: "account-verification",
        data: {
          email,
          url: `${process.env.APP_URL}/auth/verify-email?token=${token}`,
        },
      },
    });
  };
}
