"use client"

import { Award, Download } from "lucide-react"

type Props = {
  studentName: string
  courseTitle: string
  instructorName: string
  certificateNo: string
  issuedAt: string
}

export function CertificateCard({ studentName, courseTitle, instructorName, certificateNo, issuedAt }: Props) {
  const print = () => {
    const win = window.open("", "_blank", "width=900,height=650")
    if (!win) return
    const date = new Date(issuedAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Certificate - ${certificateNo}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; background: #fff; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .cert { width:820px; padding:60px; border:8px solid #4f46e5; border-radius:16px; text-align:center; background: linear-gradient(135deg,#eef2ff 0%,#fff 50%,#faf5ff 100%); }
  .logo { width:64px; height:64px; background:#4f46e5; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; }
  .logo svg { width:32px; height:32px; fill:#fff; }
  .org { font-size:13px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#6366f1; margin-bottom:8px; }
  h1 { font-size:40px; color:#1e1b4b; margin-bottom:4px; }
  .sub { font-size:14px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase; margin-bottom:40px; }
  .presents { font-size:14px; color:#6b7280; margin-bottom:8px; }
  .name { font-size:36px; color:#4f46e5; border-bottom:2px solid #c7d2fe; padding-bottom:8px; margin-bottom:20px; display:inline-block; min-width:300px; }
  .for { font-size:14px; color:#6b7280; margin-bottom:8px; }
  .course { font-size:22px; font-weight:700; color:#1e1b4b; margin-bottom:40px; }
  .meta { display:flex; justify-content:space-between; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:24px; margin-top:16px; }
  @media print { body{min-height:auto;} }
</style>
</head>
<body>
<div class="cert">
  <div class="logo"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
  <div class="org">Matrix Math Care</div>
  <h1>Certificate</h1>
  <div class="sub">of Completion</div>
  <div class="presents">This is to certify that</div>
  <div class="name">${studentName}</div>
  <div class="for">has successfully completed</div>
  <div class="course">${courseTitle}</div>
  <div class="meta">
    <div><strong>Instructor</strong><br/>${instructorName}</div>
    <div><strong>Certificate No.</strong><br/>${certificateNo}</div>
    <div><strong>Issued On</strong><br/>${date}</div>
  </div>
</div>
<script>window.onload=()=>{window.print();}</script>
</body></html>`)
    win.document.close()
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-white/5" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
            <Award className="size-6 text-amber-300" />
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            Certificate
          </span>
        </div>

        <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-1">Awarded to</p>
        <h3 className="text-xl font-extrabold">{studentName}</h3>
        <p className="mt-1 text-sm text-indigo-200">For completing</p>
        <p className="text-base font-bold mt-0.5">{courseTitle}</p>

        <div className="mt-4 border-t border-white/20 pt-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Certificate No.</p>
            <p className="text-xs font-mono font-bold text-white">{certificateNo}</p>
            <p className="mt-1 text-[10px] text-indigo-300">
              {new Date(issuedAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={print}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/30"
          >
            <Download className="size-3.5" /> Download
          </button>
        </div>
      </div>
    </div>
  )
}
