import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { verifyAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    // Role-based logic
    if (auth.role === "PATIENT") {
      if (status !== "CANCELLED") {
        return NextResponse.json({ message: "Patients can only cancel appointments" }, { status: 403 });
      }
      if (appointment.patientId.toString() !== auth.userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } else if (auth.role === "DOCTOR") {
      if (appointment.doctorId.toString() !== auth.userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    appointment.status = status;
    await appointment.save();

    // Bắn Notification cho người còn lại
    let targetUserId;
    let title = "Cập nhật lịch hẹn";
    let message = `Lịch hẹn ngày ${appointment.date} lúc ${appointment.timeRange} đã chuyển sang trạng thái: ${status}.`;

    if (auth.role === "PATIENT") {
      targetUserId = appointment.doctorId;
      title = "Bệnh nhân đã hủy lịch hẹn";
    } else if (auth.role === "DOCTOR") {
      targetUserId = appointment.patientId;
      title = "Bác sĩ đã cập nhật lịch hẹn";
    }

    if (targetUserId) {
      const { Notification } = require("@/models/Notification");
      await Notification.create({
        userId: targetUserId,
        title,
        message,
        type: "APPOINTMENT_UPDATE"
      });
    }

    return NextResponse.json({ message: "Status updated successfully", appointment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
