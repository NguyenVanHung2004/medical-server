import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const user = await User.findById(auth.userId).select("-passwordHash");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      patientProfile: user.patientProfile,
      doctorProfile: user.doctorProfile,
      avatarUrl: user.avatarUrl,
      email: user.email,
      phone: user.phone
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const updates = await req.json();

    const user = await User.findById(auth.userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (user.role === "PATIENT") {
      user.patientProfile = { ...user.patientProfile, ...updates };
    } else if (user.role === "DOCTOR") {
      user.doctorProfile = { ...user.doctorProfile, ...updates };
    }

    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.phone) user.phone = updates.phone;
    if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;

    await user.save();
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
