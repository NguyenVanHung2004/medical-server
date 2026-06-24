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
      return {
        id: doc._id,
        name: doc.fullName,
        avatarUrl: doc.avatarUrl,
        specialty: p.specialty || "",
        hospital: p.hospital || "",
        experience: `${p.yearsOfExperience || 0} years`,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0
      };
    });

    return NextResponse.json(mappedDoctors);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
