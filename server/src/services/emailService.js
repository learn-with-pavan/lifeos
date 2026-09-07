const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:
        process.env.SMTP_HOST ||
        "smtp.gmail.com",

    port:
        Number(process.env.SMTP_PORT) ||
        587,

    secure:
        process.env.SMTP_SECURE === "true",
    family: 4,
    auth: {
        user:
            process.env.SMTP_USER,

        pass:
            process.env.SMTP_PASSWORD,
    },
});


const escapeHtml = (value = "") => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


const sendOtpEmail = async ({
    email,
    otp,
    purpose,
}) => {

    const isRegistration =
        purpose === "REGISTER";


    const subject =
        isRegistration
            ? "Verify your LifeOS account"
            : "Your LifeOS login verification code";


    const title =
        isRegistration
            ? "Verify your email"
            : "Verify your login";


    const description =
        isRegistration
            ? "Welcome to LifeOS. Use the verification code below to verify your email address and complete your account setup."
            : "We received a request to sign in to your LifeOS account. Use the verification code below to continue.";


    const safeOtp =
        escapeHtml(otp);


    const year =
        new Date().getFullYear();


    const text = `
${title}

${description}

Your verification code:

${otp}

This code expires in 10 minutes.

For your security, never share this code with anyone. LifeOS support will never ask you for your verification code.

If you did not request this code, you can safely ignore this email.

© ${year} LifeOS. All rights reserved.
`;


    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="x-apple-disable-message-reformatting"
    >

    <meta
        name="color-scheme"
        content="light"
    >

    <meta
        name="supported-color-schemes"
        content="light"
    >

    <title>
        ${title}
    </title>

</head>


<body
    style="
        margin:0;
        padding:0;
        width:100%;
        background:#f4f7fb;
        font-family:
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Arial,
            Helvetica,
            sans-serif;
        color:#172033;
    "
>

    <!-- Preheader -->

    <div
        style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
            color:transparent;
        "
    >
        Your LifeOS verification code expires in 10 minutes.
    </div>


    <!-- Outer wrapper -->

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            background:#f4f7fb;
            padding:40px 16px;
        "
    >

        <tr>

            <td align="center">


                <!-- Main card -->

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width:560px;
                        background:#ffffff;
                        border-radius:24px;
                        overflow:hidden;
                        border:1px solid #e6ebf2;
                        box-shadow:
                            0 15px 45px
                            rgba(15,23,42,0.08);
                    "
                >


                    <!-- Top gradient -->

                    <tr>

                        <td
                            style="
                                height:5px;
                                background:
                                    linear-gradient(
                                        90deg,
                                        #4f46e5,
                                        #7c3aed,
                                        #06b6d4
                                    );
                                font-size:0;
                                line-height:0;
                            "
                        >
                        </td>

                    </tr>


                    <!-- Header -->

                    <tr>

                        <td
                            style="
                                padding:
                                    34px
                                    34px
                                    10px
                                    34px;
                            "
                        >

                            <table
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >

                                <tr>

                                    <!-- Logo -->

                                    <td
                                        valign="middle"
                                        style="
                                            width:46px;
                                            height:46px;
                                            background:
                                                linear-gradient(
                                                    135deg,
                                                    #4f46e5,
                                                    #7c3aed
                                                );
                                            border-radius:14px;
                                            text-align:center;
                                            vertical-align:middle;
                                        "
                                    >

                                        <span
                                            style="
                                                color:#ffffff;
                                                font-size:22px;
                                                font-weight:800;
                                                line-height:46px;
                                            "
                                        >
                                            L
                                        </span>

                                    </td>


                                    <!-- Brand -->

                                    <td
                                        valign="middle"
                                        style="
                                            padding-left:13px;
                                            vertical-align:middle;
                                        "
                                    >

                                        <div
                                            style="
                                                color:#172033;
                                                font-size:20px;
                                                font-weight:800;
                                                line-height:1;
                                            "
                                        >
                                            LifeOS
                                        </div>

                                        <div
                                            style="
                                                margin-top:5px;
                                                color:#94a3b8;
                                                font-size:11px;
                                                line-height:1;
                                            "
                                        >
                                            Your life, organized.
                                        </div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>


                    <!-- Content -->

                    <tr>

                        <td
                            style="
                                padding:
                                    22px
                                    34px
                                    34px
                                    34px;
                            "
                        >

                            <!-- Icon -->

                            <div
                                style="
                                    width:58px;
                                    height:58px;
                                    border-radius:18px;
                                    background:#eef2ff;
                                    text-align:center;
                                    line-height:58px;
                                    margin-bottom:20px;
                                "
                            >

                                <span
                                    style="
                                        color:#4f46e5;
                                        font-size:27px;
                                        font-weight:700;
                                    "
                                >
                                    ✓
                                </span>

                            </div>


                            <!-- Title -->

                            <h1
                                style="
                                    margin:0 0 12px 0;
                                    color:#172033;
                                    font-size:28px;
                                    line-height:1.2;
                                    font-weight:800;
                                    letter-spacing:-0.5px;
                                "
                            >
                                ${title}
                            </h1>


                            <!-- Description -->

                            <p
                                style="
                                    margin:0;
                                    color:#64748b;
                                    font-size:15px;
                                    line-height:1.7;
                                "
                            >
                                ${description}
                            </p>


                            <!-- OTP box -->

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    margin-top:28px;
                                "
                            >

                                <tr>

                                    <td
                                        align="center"
                                        style="
                                            padding:
                                                25px
                                                20px;
                                            background:
                                                #f8faff;
                                            border:
                                                1px solid
                                                #e5eaff;
                                            border-radius:18px;
                                        "
                                    >

                                        <div
                                            style="
                                                color:#94a3b8;
                                                font-size:11px;
                                                font-weight:700;
                                                letter-spacing:1.5px;
                                                text-transform:uppercase;
                                                margin-bottom:12px;
                                            "
                                        >
                                            Verification code
                                        </div>


                                        <div
                                            style="
                                                color:#172033;
                                                font-size:34px;
                                                line-height:1;
                                                font-weight:800;
                                                letter-spacing:10px;
                                                padding-left:10px;
                                            "
                                        >
                                            ${safeOtp}
                                        </div>

                                    </td>

                                </tr>

                            </table>


                            <!-- Expiry -->

                            <div
                                style="
                                    margin-top:15px;
                                    text-align:center;
                                    color:#64748b;
                                    font-size:12px;
                                "
                            >

                                This code expires in

                                <strong
                                    style="
                                        color:#334155;
                                    "
                                >
                                    10 minutes
                                </strong>.

                            </div>


                            <!-- Security -->

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    margin-top:28px;
                                "
                            >

                                <tr>

                                    <td
                                        style="
                                            padding:
                                                15px
                                                16px;
                                            background:#fffbeb;
                                            border:
                                                1px solid
                                                #fde68a;
                                            border-radius:13px;
                                            color:#92400e;
                                            font-size:12px;
                                            line-height:1.6;
                                        "
                                    >

                                        <strong>
                                            Security tip:
                                        </strong>

                                        Never share this code
                                        with anyone. LifeOS
                                        support will never ask
                                        you for your verification
                                        code.

                                    </td>

                                </tr>

                            </table>


                            <!-- Ignore message -->

                            <p
                                style="
                                    margin:
                                        25px
                                        0
                                        0
                                        0;
                                    color:#94a3b8;
                                    font-size:12px;
                                    line-height:1.6;
                                "
                            >
                                If you did not request this
                                code, you can safely ignore
                                this email. Your account
                                remains secure.
                            </p>

                        </td>

                    </tr>


                    <!-- Footer -->

                    <tr>

                        <td
                            style="
                                padding:
                                    22px
                                    34px
                                    28px
                                    34px;
                                border-top:
                                    1px solid
                                    #eef2f6;
                                background:#fbfcfe;
                            "
                        >

                            <div
                                style="
                                    color:#64748b;
                                    font-size:12px;
                                    font-weight:600;
                                "
                            >
                                LifeOS
                            </div>

                            <div
                                style="
                                    margin-top:5px;
                                    color:#a1aab8;
                                    font-size:11px;
                                    line-height:1.5;
                                "
                            >
                                Your life, organized.
                            </div>

                            <div
                                style="
                                    margin-top:15px;
                                    color:#c0c7d2;
                                    font-size:10px;
                                "
                            >
                                © ${year} LifeOS.
                                All rights reserved.
                            </div>

                        </td>

                    </tr>


                </table>

                <!-- End main card -->


            </td>

        </tr>

    </table>

</body>

</html>
`;


    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            email,

        replyTo:
            process.env.SMTP_REPLY_TO ||
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        subject,

        text,

        html,

    });
};


module.exports = {
    sendOtpEmail,
};