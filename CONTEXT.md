# Matrix Math Care — Full Stack Online Coaching Platform

## Tech Stack
- Framework: Next.js 14 App Router (TypeScript)
- Styling: Tailwind CSS + shadcn/ui (Radix UI based)
- Auth: NextAuth.js v5 with Prisma adapter
- Database: PostgreSQL via Supabase
- ORM: Prisma 7
- Payments: SSLCommerz (Bangladesh — supports bKash, Nagad, cards)
- SMS: Twilio
- Email: Resend
- File/CSV parsing: papaparse
- Password hashing: bcryptjs
- Icons: Lucide React

## User Roles
There are 3 roles: student, admin, teacher

### Student
- Registers with name, email, password, phone, roll_number
- Logs in → redirected to /student/dashboard
- Can view and watch enrolled courses and lessons
- Can see own test marks by roll_number + highest mark in exam
- Can download certificates
- Can pay fees online via SSLCommerz
- Can view payment history
- Can receive SMS and email notifications
- Can participate in forum discussions
- Can chat with teacher
- Can take quizzes
- Can bookmark lessons
- Can view live class schedule

### Teacher
- Created by admin (no self-registration)
- Logs in → redirected to /teacher/dashboard
- Can view only their own courses (where instructor_id matches)
- Can add and edit lessons within their courses
- Can view students enrolled in their courses only
- Can view marks for exams related to their courses
- Can chat with students
- Can send notifications to their students
- Can schedule live classes
- Cannot access admin panel
- Cannot see other teachers courses

### Admin
- Logs in → redirected to /admin/dashboard
- Full access to everything
- Can create, edit, delete courses and assign instructors
- Can manage all students and teachers
- Can upload test marks via CSV or manual entry
- Can create and manage exams
- Can send SMS and email to all students or specific roll number
- Can manage payments and view revenue reports
- Can create and manage coupons and discounts
- Can publish and manage blog posts
- Can issue certificates to students
- Can manage quizzes
- Can view and moderate forum threads
- Can manage all user roles

## Route Structure
- / → public homepage
- /courses → public course listings
- /courses/[slug] → public course detail with free preview
- /about → public about page
- /contact → public contact/inquiry form
- /blog → public blog listing
- /blog/[slug] → single blog post
- /faq → public FAQ page
- /instructors → public instructor profiles
- /login → login page (redirects by role after login)
- /register → student self-registration only
- /student/* → protected, student role only
- /teacher/* → protected, teacher role only
- /admin/* → protected, admin role only

## Student Pages
- /student/dashboard — progress summary, recent marks, upcoming classes
- /student/courses — enrolled courses with progress bars
- /student/courses/[courseId] — course overview
- /student/courses/[courseId]/lesson/[lessonId] — video player + notes
- /student/marks — all exams: Exam Name, Subject, Date, Your Mark, Highest Mark, Total
- /student/marks/[examId] — detailed single exam result
- /student/quizzes/[quizId] — take a quiz
- /student/certificates — download certificates
- /student/live-classes — upcoming live session calendar
- /student/payments — payment history + Pay Now button
- /student/notifications — all notifications received
- /student/chat — message teacher
- /student/forum — group discussions
- /student/profile — view and edit profile

## Teacher Pages
- /teacher/dashboard — my courses overview, enrolled students count, upcoming classes
- /teacher/courses — only courses where instructor_id = logged in teacher
- /teacher/courses/[courseId] — manage course, add/edit/delete lessons
- /teacher/students — students enrolled in my courses only
- /teacher/marks — marks for exams related to my courses
- /teacher/live-classes — schedule and manage live sessions
- /teacher/notifications — received notifications
- /teacher/chat — chat with students
- /teacher/profile — view and edit profile

## Admin Pages
- /admin/dashboard — total students, revenue, exams uploaded, courses published, recent payments
- /admin/students — searchable table of all students
- /admin/students/[studentId] — student detail with marks and payments
- /admin/teachers — manage all teachers
- /admin/courses — all courses table
- /admin/courses/new — create new course, assign instructor
- /admin/courses/[courseId]/edit — edit course
- /admin/marks — all exams overview
- /admin/marks/upload — create exam + upload CSV (roll_number, marks_obtained, remarks)
- /admin/marks/[examId] — full mark sheet, editable
- /admin/payments — all payments from all students
- /admin/notifications — send SMS/email to all or specific roll number
- /admin/coupons — manage discount codes
- /admin/blog — manage blog posts
- /admin/certificates — issue certificates to students
- /admin/quizzes — manage quizzes
- /admin/forum — moderate forum threads
- /admin/roles — manage user roles
- /admin/reports — revenue and analytics charts

## API Routes
- /api/auth/[...nextauth] — NextAuth handlers
- /api/register — POST create student account
- /api/students — GET all, POST create
- /api/students/[id] — GET, PUT, DELETE
- /api/courses — GET all, POST create
- /api/courses/[id] — GET, PUT, DELETE
- /api/lessons — GET, POST
- /api/lessons/[id] — GET, PUT, DELETE
- /api/enrollments — GET, POST
- /api/marks — GET all exams
- /api/marks/[examId] — GET student own mark + MAX mark for that exam
- /api/marks/upload — POST bulk insert marks from CSV
- /api/payments — GET history, POST create
- /api/payments/webhook — POST SSLCommerz callback
- /api/notifications/sms — POST send SMS via Twilio
- /api/notifications/email — POST send email via Resend
- /api/upload — POST file upload to Supabase Storage
- /api/certificates — GET, POST
- /api/quizzes — GET, POST
- /api/forum — GET, POST
- /api/chat — GET, POST
- /api/reports/revenue — GET revenue data

## Database Tables (Prisma Models)

### users
id, name, email, password, roll_number (unique, nullable), role (student/admin/teacher), phone, createdAt, updatedAt

### courses
id, title, slug (unique), description, instructor_id (→ users), price, thumbnail, is_published, createdAt, updatedAt

### lessons
id, course_id (→ courses), title, video_url, duration (seconds), order, createdAt, updatedAt

### enrollments
id, student_id (→ users), course_id (→ courses), progress (0-100), createdAt, updatedAt

### exams
id, title, subject, total_marks, exam_date, created_by (→ users), createdAt, updatedAt

### student_marks
id, exam_id (→ exams), student_id (→ users), roll_number, marks_obtained, remarks, createdAt, updatedAt

### payments
id, student_id (→ users), amount, method, status, txn_id (unique), createdAt, updatedAt

### notifications
id, recipient_id (→ users), type, message, is_read, createdAt, updatedAt

### blog_posts
id, title, slug (unique), content, author_id (→ users), is_published, createdAt, updatedAt

### coupons
id, code (unique), discount_type, discount_value, is_active, expires_at, created_by (→ users), createdAt, updatedAt

### certificates
id, student_id (→ users), course_id, title, issued_at, certificate_no (unique), createdAt, updatedAt

### quizzes
id, title, description, course_id, created_by (→ users), is_published, createdAt, updatedAt

### forum_threads
id, title, content, author_id (→ users), is_locked, createdAt, updatedAt

### chat_messages
id, sender_id (→ users), receiver_id, thread_id, message, sent_at, createdAt, updatedAt

## Key Business Rules
- Students can only see their OWN marks, never other students marks
- API must verify roll_number matches logged in user before returning marks
- MAX(marks_obtained) per exam is shown as highest mark (no names exposed)
- Teachers can only access their own courses and their students
- Admin has full access to everything
- Passwords are always hashed with bcryptjs before saving
- All /student/* /teacher/* /admin/* routes are protected by middleware.ts
- After login: student → /student/dashboard, teacher → /teacher/dashboard, admin → /admin/dashboard
- SSLCommerz is in sandbox mode (SSLCOMMERZ_IS_LIVE=false)
- Every sent notification is saved to notifications table

## Components Structure
- components/ui/ — shadcn/ui base components
- components/layout/ — Navbar, Footer, StudentSidebar, TeacherSidebar, AdminSidebar
- components/marks/ — MarksTable, MarksUploadForm, ExamCard
- components/student/ — ProgressBar, VideoPlayer, CourseCard
- components/teacher/ — LessonForm, StudentList
- components/admin/ — StatCard, DataTable, ChartWidget, RevenueChart
- components/shared/ — NotificationBell, Avatar, LoadingSpinner, ErrorMessage

## Environment Variables needed in .env
DATABASE_URL — Supabase pooler connection string
DIRECT_URL — Supabase direct connection string
NEXTAUTH_SECRET — random secret string
NEXTAUTH_URL — http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key
SSLCOMMERZ_STORE_ID — SSLCommerz store ID
SSLCOMMERZ_STORE_PASSWORD — SSLCommerz store password
SSLCOMMERZ_IS_LIVE — false
TWILIO_ACCOUNT_SID — Twilio account SID
TWILIO_AUTH_TOKEN — Twilio auth token
TWILIO_PHONE_NUMBER — Twilio phone number
RESEND_API_KEY — Resend API key       