# Function Specification: Training Enrollment (Đăng ký khóa học)

## Function Trigger:

**Navigation Path:**
•	After successful login, Employee users can access the Training module by clicking "Đào tạo" (Training) from the left sidebar menu or navigating to `/employee/training` or `/training`.

•	Users can also access this function directly from the Homepage by clicking on the "Training & Certification" feature card.

**Timing/Frequency:**
•	Accessed whenever an Employee wants to:
  - View available training courses
  - Enroll in a new training course
  - Check enrollment status
  - View completed courses

•	Typically accessed when:
  - Employee needs to complete mandatory training
  - Employee wants to improve skills through optional courses
  - Employee needs to retake a failed course

---

## Function Description:

**Actors/Roles:**
•	**Employee**: Primary user who enrolls in training courses
•	**Admin**: Can view all enrollments and manage them (via Admin Training Management)
•	**Guest**: No access to this function (requires authentication)

**Purpose:**
•	To allow employees to browse available training courses and enroll in sessions.
•	To manage employee training enrollments and track progress.
•	To validate prerequisites before allowing enrollment.
•	To provide visibility into enrollment status (enrolled, submitted, completed, failed).

**Interface:**

•	**Header navigation bar**: Home, About, Help Center, Contact, FAQ, User Profile/Settings.

•	**Left sidebar**: Home, Profile, Support Tickets, Notifications, Help Center, FAQs, Settings, Logout.

•	**Main content area with 3 tabs:**
  - **Tab "Khóa học có sẵn" (Available Courses)**: 
    - Displays courses not yet enrolled
    - Shows course name, description, duration, validity, course set
    - "Bắt buộc" (Mandatory) tag for required courses
    - "Đăng ký" (Enroll) button for each course
  
  - **Tab "Đã đăng ký" (Enrolled Courses)**:
    - Displays courses currently enrolled
    - Status badges: Blue (enrolled), Orange (submitted), Green (completed), Red (failed)
    - Action buttons: "Vào học" (Start Training), "Đã nộp, chờ chấm điểm" (disabled), "Làm lại bài" (Retake)
    - Score display (if graded)
  
  - **Tab "Đã hoàn thành" (Completed Courses)**:
    - Displays courses with status = "completed"
    - Shows final score and completion date

•	**Search and Filter:**
  - Search bar to filter courses by name or description
  - Filter by Course Set (optional)
  - Filter by Mandatory/Optional (optional)

**Data Processing:**
•	The system loads all available courses from the database.
•	The system filters out courses already enrolled by the current user.
•	When user clicks "Đăng ký":
  - System calls `GET /training/courses/:courseId/available-sessions` to find available sessions
  - Validates prerequisites (if course has `prerequisite_course_ids`)
  - Checks session capacity (enrollments < max_participants)
  - Creates enrollment via `POST /training/enrollments`
•	The system updates the UI to move the course from "Available" to "Enrolled" tab after successful enrollment.

**Screen Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Header Navigation Bar                                  │
├──────────┬──────────────────────────────────────────────┤
│          │  Training Module                             │
│ Sidebar  │  ┌────────────────────────────────────────┐  │
│          │  │  Search: [____________] [Filter]      │  │
│ - Home   │  ├────────────────────────────────────────┤  │
│ - Profile│  │  Tabs: [Available] [Enrolled] [Completed]│
│ - Training│ ├────────────────────────────────────────┤  │
│ - ...    │  │  Course Cards:                         │  │
│          │  │  ┌─────────────┐  ┌─────────────┐     │  │
│          │  │  │ Course Name │  │ Course Name │     │  │
│          │  │  │ Description │  │ Description │     │  │
│          │  │  │ [Đăng ký]   │  │ [Đăng ký]   │     │  │
│          │  │  └─────────────┘  └─────────────┘     │  │
│          │  └────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────┘
```

---

## Function Details:

**Input Data:**
•	**Course Selection**: User clicks "Đăng ký" button on a course card
•	**User ID**: Automatically retrieved from authenticated session
•	**Session ID**: Automatically selected from available sessions (first available session)

**Validation:**

**Frontend Validation:**
•	User must be authenticated (redirect to login if not)
•	Course must exist and be available
•	User must not already be enrolled in the course

**Backend Validation (via API):**
•	Session must exist and be valid
•	Session status must be `SCHEDULED` or `ONGOING` (not `COMPLETED` or `CANCELLED`)
•	Session must have available capacity (current enrollments < max_participants)
•	User must not already be enrolled in this specific session
•	**Prerequisites Check**: If course has `prerequisite_course_ids`:
  - User must have completed all prerequisite courses (status = "completed")
  - If prerequisites not met, enrollment is rejected with error message

**Business Rules:**
•	**Enrollment Status Flow:**
  - Initial status: `enrolled` (after successful enrollment)
  - After submission: `submitted` (waiting for grading)
  - After grading: `completed` (if passed) or `failed` (if not passed)
  - Failed courses can be retaken (status resets to `enrolled`)

•	**Session Selection:**
  - System automatically selects the first available session
  - Available session criteria:
    - Status = `SCHEDULED` or `ONGOING`
    - Not full (enrollments < max_participants)
    - User not already enrolled
  - If no available session, enrollment is rejected with warning message

•	**Prerequisites Enforcement:**
  - Mandatory: User must complete all prerequisite courses before enrolling
  - Prerequisites are checked by course `prerequisite_course_ids` field
  - Error message: "Bạn cần hoàn thành X khóa học tiên quyết trước"

•	**Role-based Access:**
  - Only `Employee` role can enroll in courses
  - `Admin` can view all enrollments but enrollments are managed separately
  - `Guest` has no access to this function

•	**Mandatory Courses:**
  - Courses with `is_mandatory = true` are marked with "Bắt buộc" tag
  - Employees should prioritize mandatory courses

**Normal Cases (happy path):**

**Case 1: Successful Enrollment (No Prerequisites)**
```
1. Employee navigates to Training page → Tab "Khóa học có sẵn"
   ↓
2. Employee clicks "Đăng ký" on a course
   ↓
3. Frontend calls: GET /training/courses/:courseId/available-sessions
   ↓
4. Backend returns available sessions
   ↓
5. Frontend selects first available session
   ↓
6. Frontend calls: POST /training/enrollments
   Body: { session_id: "...", user_id: "..." }
   ↓
7. Backend validates:
   - Session exists ✓
   - User not enrolled ✓
   - Session has capacity ✓
   - No prerequisites (or prerequisites met) ✓
   ↓
8. Backend creates Enrollment:
   - status: "enrolled"
   - enrolled_at: current timestamp
   ↓
9. Backend returns success response
   ↓
10. Frontend shows success message: "Đăng ký thành công!"
   ↓
11. Page reloads → Course moves to "Đã đăng ký" tab
```

**Case 2: Successful Enrollment (With Prerequisites Met)**
```
1. Employee clicks "Đăng ký" on course with prerequisites
   ↓
2. Backend checks prerequisites:
   - User has completed all prerequisite courses ✓
   ↓
3. Enrollment proceeds as normal (same as Case 1)
```

**Case 3: View Enrolled Courses**
```
1. Employee navigates to Tab "Đã đăng ký"
   ↓
2. System displays all courses with enrollment status
   ↓
3. Status badges show current state:
   - Blue: "Đã đăng ký" (enrolled) → Button "Vào học"
   - Orange: "Đã nộp, chờ chấm" (submitted) → Button disabled
   - Green: "Hoàn thành" (completed) → Shows score
   - Red: "Chưa đạt" (failed) → Button "Làm lại bài"
```

**Abnormal Cases (error path):**

**Case 1: No Available Sessions**
```
1. Employee clicks "Đăng ký"
   ↓
2. Frontend calls: GET /training/courses/:courseId/available-sessions
   ↓
3. Backend returns empty array (no available sessions)
   ↓
4. Frontend shows warning: "Không có buổi đào tạo nào khả dụng cho khóa học này"
   ↓
5. Enrollment is not created
```

**Case 2: Prerequisites Not Met**
```
1. Employee clicks "Đăng ký" on course with prerequisites
   ↓
2. Backend checks prerequisites:
   - User has NOT completed prerequisite courses ✗
   ↓
3. Backend returns error:
   {
     success: false,
     message: "Prerequisites not met",
     data: { missingPrerequisites: [...] }
   }
   ↓
4. Frontend shows error: "Bạn cần hoàn thành X khóa học tiên quyết trước"
   ↓
5. Enrollment is rejected
```

**Case 3: Session Already Full**
```
1. Employee clicks "Đăng ký"
   ↓
2. Backend validates:
   - Session exists ✓
   - User not enrolled ✓
   - Session capacity: FULL ✗ (enrollments >= max_participants)
   ↓
3. Backend returns error: "Buổi đào tạo đã đầy, vui lòng chọn buổi khác"
   ↓
4. Frontend shows error message
   ↓
5. Enrollment is rejected
```

**Case 4: Already Enrolled**
```
1. Employee clicks "Đăng ký" on course already enrolled
   ↓
2. Backend validates:
   - User already enrolled in this session ✗
   ↓
3. Backend returns error: "Bạn đã đăng ký buổi đào tạo này rồi"
   ↓
4. Frontend shows error message
   ↓
5. Enrollment is rejected
```

**Case 5: Session Status Invalid**
```
1. Employee clicks "Đăng ký"
   ↓
2. Backend validates:
   - Session status = COMPLETED or CANCELLED ✗
   ↓
3. Backend returns error: "Buổi đào tạo không còn khả dụng"
   ↓
4. Frontend shows error message
   ↓
5. Enrollment is rejected
```

**Case 6: Server/Network Error**
```
1. Employee clicks "Đăng ký"
   ↓
2. API call fails (network error, server error)
   ↓
3. Frontend catches error
   ↓
4. Frontend shows error: "Có lỗi xảy ra. Vui lòng thử lại sau."
   ↓
5. Enrollment is not created
```

**Case 7: Unauthenticated User**
```
1. Guest/Unauthenticated user tries to access Training page
   ↓
2. System redirects to Login page
   ↓
3. After login, user is redirected back to Training page
```

---

## API Endpoints Used:

**GET /training/courses/:courseId/available-sessions**
- Purpose: Get available sessions for a course
- Returns: Array of available sessions
- Used before enrollment to find valid sessions

**POST /training/enrollments**
- Purpose: Create new enrollment
- Body: `{ session_id: string, user_id: string }`
- Returns: Enrollment object with status "enrolled"
- Used to enroll user in a course session

**GET /training/courses**
- Purpose: Get all courses
- Used to display available courses list

**GET /training/enrollments**
- Purpose: Get all enrollments (filtered by user)
- Used to display enrolled courses

---

## Data Models:

**Enrollment Object:**
```javascript
{
  _id: string,
  session_id: {
    _id: string,
    session_name: string,
    course_id: {
      _id: string,
      course_name: string,
      ...
    },
    start_time: string,
    end_time: string,
    max_participants: number,
    status_code: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  },
  user_id: {
    _id: string,
    full_name: string,
    email: string
  },
  enrolled_at: string,
  status: 'enrolled' | 'submitted' | 'completed' | 'failed' | 'cancelled',
  score?: number,
  passed?: boolean,
  completion_date?: string,
  created_at: string,
  updated_at: string
}
```

**Course Object:**
```javascript
{
  _id: string,
  course_set_id: {
    _id: string,
    name: string
  },
  course_name: string,
  description: string,
  duration_hours: number,
  is_mandatory: boolean,
  validity_months?: number,
  prerequisite_course_ids?: string[],
  created_at: string,
  updated_at: string
}
```

---

## Success Criteria:

✅ User can view all available courses
✅ User can enroll in courses with available sessions
✅ System validates prerequisites before enrollment
✅ System prevents duplicate enrollments
✅ System handles full sessions gracefully
✅ User can view enrollment status
✅ Error messages are clear and actionable
✅ UI updates correctly after enrollment
✅ All edge cases are handled properly

---

## Notes:

•	The system automatically selects the first available session. Future enhancement: Allow user to choose from multiple available sessions.

•	Prerequisites are enforced at the backend level. Frontend can show prerequisite information but validation happens server-side.

•	Enrollment status "submitted" is detected by checking: `status = "enrolled" && score = null && has submission`. The UI may show this as a separate state.

•	Failed courses can be retaken, which resets the enrollment status back to "enrolled" and allows the user to start fresh.


