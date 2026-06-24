import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { User } from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth || auth.role !== "PATIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { doctorId, date, timeRange, reason, type } = await req.json();

    const newAppointment = new Appointment({
      patientId: auth.userId,
      doctorId,
      date,
      timeRange,
      reason,
      type
    });

    await newAppointment.save();

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query: any = {};
    if (auth.role === "PATIENT") {
      query.patientId = auth.userId;
    } else if (auth.role === "DOCTOR") {
      query.doctorId = auth.userId;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("doctorId", "fullName avatarUrl doctorProfile.specialty")
      .populate("patientId", "fullName avatarUrl patientProfile.gender patientProfile.dob")
      .sort({ createdAt: -1 });

    const formatted = appointments.map(app => ({
      id: app._id,
      doctor: {
        id: app.doctorId._id,
        name: (app.doctorId as any).fullName,
        avatarUrl: (app.doctorId as any).avatarUrl,
        specialty: (app.doctorId as any).doctorProfile?.specialty
      },
      patientName: (app.patientId as any).fullName,
      patientInitial: (app.patientId as any).fullName.charAt(0).toUpperCase(),
      patientGender: (app.patientId as any).patientProfile?.gender,
      patientAvatarUrl: (app.patientId as any).avatarUrl,
      date: app.date,
      timeRange: app.timeRange,
      reason: app.reason,
      location: app.location,
      status: app.status,
      type: app.type
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
