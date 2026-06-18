export const verificationEmailTemplate = (
  username: string,
  verificationLink: string
) => {
  return {
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Hello ${username},</h2>

        <p>
          Thank you for registering. Please verify your email address by clicking the button below.
        </p>

        <a
          href="${verificationLink}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Verify Email
        </a>

        <p style="margin-top:20px;">
          If you did not create this account, please ignore this email.
        </p>

        <p>
          This verification link will expire automatically.
        </p>
      </div>
    `,
  };
};

export const forgotPasswordEmailTemplate = (
  username: string,
  resetLink: string
) => {
  return {
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Hello ${username},</h2>

        <p>
          We received a request to reset your password.
        </p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#dc2626;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top:20px;">
          If you did not request a password reset, please ignore this email.
        </p>

        <p>
          This reset link will expire automatically.
        </p>
      </div>
    `,
  };
};
export const forgotPasswordTemplate = (
  fullname: string,
  resetLink: string
) => {
  return {
    subject: "Reset Your Password",
    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;padding:40px;color:#333">
        <h2>Password Reset Request</h2>

        <p>Hello <strong>${fullname}</strong>,</p>

        <p>
          We received a request to reset your password.
          Click the button below to create a new password.
        </p>

        <div style="margin:30px 0">
          <a
            href="${resetLink}"
            style="
              background:#111827;
              color:white;
              padding:14px 28px;
              text-decoration:none;
              border-radius:8px;
              display:inline-block;
              font-weight:600;
            "
          >
            Reset Password
          </a>
        </div>

        <p>
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
        </p>

        <hr />

        <p style="font-size:13px;color:#666">
          For security reasons, never share your password or recovery code with anyone.
        </p>
      </div>
    `,
  };
};  