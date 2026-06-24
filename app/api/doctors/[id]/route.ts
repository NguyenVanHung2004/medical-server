import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const doctor = await User.findOne({ _id: id, role: UserRole.DOCTOR }).select("-passwordHash -patientProfile -email -phone");
    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const p = doctor.doctorProfile || {};
    const offerings = p.consultationOfferings || [];
    const supportedTypes = offerings.filter(o => o.isEnabled).map(o => o.type);

    return NextResponse.json({
      id: doctor._id,
      name: doctor.fullName,
      specialty: p.specialty || "",
      hospital: p.hospital || "",
      avatarUrl: doctor.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(doctor.fullName),
      rating: p.rating || 0,
      yearsOfExperience: p.yearsOfExperience || 0,
      isOnline: true,
      supportedTypes: supportedTypes.length > 0 ? supportedTypes : ["ONLINE", "OFFLINE"],
      isFullyBookedToday: false,
      reviewCount: p.reviewCount || 0,
      bio: p.bio || ""
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
