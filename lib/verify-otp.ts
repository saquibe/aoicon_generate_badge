import { getDatabase } from "@/lib/mongodb";

export async function verifyOtp(identifier: string, otp: string) {
  const normalizedIdentifier = identifier.trim();
  const isEmail = normalizedIdentifier.includes("@");
  const isMobile = /^\d{10}$/.test(normalizedIdentifier);

  if (!isEmail && !isMobile) return null;

  const db = await getDatabase();
  const usersCollection = db.collection("user_reg");
  const otpValue = String(otp).trim();
  const otpValues: (string | number)[] = [otpValue];
  if (/^\d+$/.test(otpValue)) otpValues.push(Number(otpValue));

  const query = isEmail
    ? {
        "Email ID": {
          $regex: `^${normalizedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
        otp: { $in: otpValues },
        otpExpiry: { $gt: new Date() },
      }
    : {
        Mobile: {
          $in: [normalizedIdentifier, Number(normalizedIdentifier)],
        },
        otp: { $in: otpValues },
        otpExpiry: { $gt: new Date() },
      };

  const user = await usersCollection.findOne(query);
  if (!user) return null;

  await usersCollection.updateOne(
    { _id: user._id },
    { $unset: { otp: "", otpExpiry: "" } },
  );

  return {
    id: user._id.toString(),
    name: user["Full Name"],
    email: user["Email ID"],
    registrationNumber: user["Registration Number"],
    badgeCategory: user.badge_category,
    mobile: user["Mobile"].toString(),
    certUrl: user["cert_url"],
  };
}
