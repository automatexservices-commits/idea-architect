import crypto from "node:crypto";

const RAZORPAY_WEBHOOK_SECRET =
  "PASTE_YOUR_RAZORPAY_WEBHOOK_SECRET_HERE"; // Paste your Razorpay Webhook Secret here

function getRawBody(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === "string") return Buffer.from(req.rawBody, "utf8");
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  return null;
}

export default function razorpayWebhook(req, res, next) {
  const signature = req.headers["x-razorpay-signature"];

  if (typeof signature !== "string" || signature.length === 0) {
    return res.status(400).send("Invalid webhook signature");
  }

  const rawBody = getRawBody(req);
  if (!rawBody) {
    return res.status(400).send("Invalid webhook signature");
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  const isValid =
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!isValid) {
    return res.status(400).send("Invalid webhook signature");
  }

  return next();
}

export { razorpayWebhook };
