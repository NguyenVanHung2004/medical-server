import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    const doctor = await User.findOne({ _id: id, role: UserRole.DOCTOR }).select("-passwordHash -patientProfile -email -phone");
    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const p = doctor.doctorProfile || {};

    return NextResponse.json({
      id: doctor._id,
      name: doctor.fullName,
      avatarUrl: doctor.avatarUrl,
      specialty: p.specialty || "",
      hospital: p.hospital || "",
      bio: p.bio || "",
      yearsOfExperience: p.yearsOfExperience || 0,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      consultationOfferings: p.consultationOfferings || [],
      workingSchedule: p.workingSchedule || {}
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
