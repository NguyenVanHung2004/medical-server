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

    const appointment = await Appointment.findById(id)
      .populate("patientId", "fullName")
      .populate("doctorId", "fullName");

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    const patientIdStr = appointment.patientId._id.toString();
    const doctorIdStr = appointment.doctorId._id.toString();
    
    const patientName = (appointment.patientId as any).fullName;
    const doctorName = (appointment.doctorId as any).fullName;

    // Role-based logic
    if (auth.role === "PATIENT") {
      if (status !== "CANCELLED") {
        return NextResponse.json({ message: "Patients can only cancel appointments" }, { status: 403 });
      }
      if (patientIdStr !== auth.userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } else if (auth.role === "DOCTOR") {
      if (doctorIdStr !== auth.userId) {
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
    let message = "";

    const formatStatus = (st: string) => {
       const map: Record<string, string> = {
         CONFIRMED: "Đã xác nhận",
         CANCELLED: "Đã hủy",
         UPCOMING: "Sắp tới",
         COMPLETED: "Đã hoàn thành",
         HAPPENING: "Đang diễn ra"
       };
       return map[st] || st;
    }

    if (auth.role === "PATIENT") {
      targetUserId = doctorIdStr;
      title = "Lịch hẹn bị hủy";
      message = `Bệnh nhân ${patientName} đã hủy lịch hẹn khám vào lúc ${appointment.timeRange} ngày ${appointment.date}.`;
    } else if (auth.role === "DOCTOR") {
      targetUserId = patientIdStr;
      if (status === "CANCELLED") {
          title = "Bác sĩ đã hủy lịch hẹn";
          message = `Bác sĩ ${doctorName} rất tiếc không thể tiếp nhận lịch hẹn khám của bạn vào lúc ${appointment.timeRange} ngày ${appointment.date}.`;
      } else if (status === "UPCOMING" || status === "CONFIRMED") {
          title = "Lịch hẹn được xác nhận";
          message = `Bác sĩ ${doctorName} đã xác nhận lịch hẹn của bạn vào lúc ${appointment.timeRange} ngày ${appointment.date}.`;
      } else {
          title = "Cập nhật trạng thái khám";
          message = `Lịch hẹn của bạn với Bác sĩ ${doctorName} (lúc ${appointment.timeRange} ngày ${appointment.date}) đã chuyển sang: ${formatStatus(status)}.`;
      }
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
