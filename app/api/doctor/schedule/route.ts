import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, UserRole } from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth || auth.role !== UserRole.DOCTOR) {
      return NextResponse.json({ message: "Unauthorized or not a doctor" }, { status: 401 });
    }

    await dbConnect();
    const { workingSchedule } = await req.json();

    const doctor = await User.findById(auth.userId);
    if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });

    doctor.doctorProfile = {
      ...(doctor.doctorProfile || {}),
      workingSchedule
    };

    await doctor.save();

    return NextResponse.json({ message: "Schedule updated", workingSchedule: doctor.doctorProfile.workingSchedule });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
