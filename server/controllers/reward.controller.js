const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

// Configure the email engine (Using Gmail for the hackathon demo)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g., innovit26.demo@gmail.com
        pass: process.env.EMAIL_APP_PASSWORD // MUST be a Google App Password, not your normal password!
    }
});

const claimReward = async (req, res) => {
    try {
        // Data sent from Aditya's React StorePage after the Web3 burn succeeds
        const { studentEmail, studentName, itemName, transactionHash } = req.body;

        if (!studentEmail || !itemName) {
            return res.status(400).json({ success: false, message: "Missing email or item name." });
        }

        // 1. Generate the verification payload for the cafeteria staff to scan
        const qrPayload = JSON.stringify({
            txHash: transactionHash,
            item: itemName,
            email: studentEmail,
            verified: true,
            timestamp: Date.now()
        });

        // 2. Convert payload into a physical QR code image (Base64 URI string)
        const qrImageBase64 = await QRCode.toDataURL(qrPayload);

        // 3. Draft the beautiful HTML Email with CID Attachment
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: `🎉 Reward Claimed: Your ${itemName} is ready!`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f8fafc; border-radius: 12px;">
                    <h2 style="color: #1e293b;">Congratulations, ${studentName}!</h2>
                    <p style="color: #475569; font-size: 16px;">You successfully burned your MEAL tokens for a <b>${itemName}</b>.</p>
                    <div style="margin: 30px 0;">
                        <img src="cid:rewardqrcode" alt="Reward QR Code" style="width: 250px; height: 250px; border: 4px solid #10b981; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
                    </div>
                    <p style="color: #475569;">Show this QR code at the cafeteria counter to redeem your reward.</p>
                    <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">Tx Hash: ${transactionHash}</p>
                </div>
            `,
            attachments: [{
                filename: 'qrcode.png',
                content: qrImageBase64.split("base64,")[1], // Strips the data:image prefix
                encoding: 'base64',
                cid: 'rewardqrcode' // Matches the src="cid:rewardqrcode" above
            }]
        };

        // 4. Send the email!
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: "Reward QR Code emailed successfully!" 
        });

    } catch (error) {
        console.error("QR Email Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate and email QR code." });
    }
};

module.exports = { claimReward };