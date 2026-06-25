import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const appointment = await Appointment.findById(id)
      .populate("doctorId", "fullName avatarUrl doctorProfile.specialty")
      .populate("patientId", "fullName avatarUrl patientProfile.gender patientProfile.dob");

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    // Ensure the user is authorized to see this appointment
    if (appointment.patientId._id.toString() !== auth.userId && appointment.doctorId._id.toString() !== auth.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formatted = {
      id: appointment._id,
      doctor: {
        id: appointment.doctorId._id,
        name: (appointment.doctorId as any).fullName,
        avatarUrl: (appointment.doctorId as any).avatarUrl,
        specialty: (appointment.doctorId as any).doctorProfile?.specialty
      },
      patientName: (appointment.patientId as any).fullName,
      patientInitial: (appointment.patientId as any).fullName.charAt(0).toUpperCase(),
      patientGender: (appointment.patientId as any).patientProfile?.gender,
      patientAge: 0,
      patientIdStr: appointment.patientId._id.toString(),
      patientAvatarUrl: (appointment.patientId as any).avatarUrl,
      date: appointment.date,
      timeRange: appointment.timeRange,
      reason: appointment.reason,
      location: appointment.location,
      status: appointment.status,
      type: appointment.type
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
