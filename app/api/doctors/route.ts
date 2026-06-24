import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty");
    const search = searchParams.get("search");

    let query: any = { role: UserRole.DOCTOR };
    if (specialty) {
      query["doctorProfile.specialty"] = specialty;
    }
    if (search) {
      query["fullName"] = { $regex: search, $options: "i" };
    }

    const doctors = await User.find(query).select("-passwordHash -patientProfile -email -phone");

    const mappedDoctors = doctors.map((doc) => {
      const p = doc.doctorProfile || {};
      const offerings = p.consultationOfferings || [];
      const isOnlineConsultationEnabled = offerings.some(o => o.type === 'ONLINE' && o.isEnabled);
      const onlineFee = offerings.find(o => o.type === 'ONLINE')?.fee || 0;
      const isInPersonConsultationEnabled = offerings.some(o => (o.type === 'OFFLINE' || o.type === 'HOME_VISIT') && o.isEnabled);
      const inPersonFee = offerings.find(o => o.type === 'OFFLINE' || o.type === 'HOME_VISIT')?.fee || 0;

      return {
        id: doc._id,
        name: doc.fullName,
        avatarUrl: doc.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(doc.fullName),
        specialty: p.specialty || "",
        hospital: p.hospital || "",
        experience: `${p.yearsOfExperience || 0} năm`,
        isOnlineConsultationEnabled,
        onlineConsultationFee: onlineFee,
        isInPersonConsultationEnabled,
        inPersonConsultationFee: inPersonFee,
        workingHoursSummary: "Thứ 2 - Thứ 6\n08:00 - 11:30\n13:30 - 17:00",
        workingSchedule: p.workingSchedule || {}
      };
    });

    return NextResponse.json(mappedDoctors);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
