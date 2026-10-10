# School Database Design

## 1. Tables

### Students
The `students` table stores student details, including their ID, name and email address. `student_id` is the primary key, while `email` is required and must be unique.

### Courses
The `courses` table stores course information. `course_id` is the primary key, and `course_name` is required and unique.

### Enrolments
The `enrolments` table records which students take which courses, including their grades. Its primary key is `enrolment_id`. The `student_id` and `course_id` columns are foreign keys referencing the students and courses tables. A unique constraint on both columns prevents a student from enrolling in the same course more than once.

## 2. Relationships

A student can enrol in many courses, creating a one-to-many relationship between students and enrolments. Each course can also have many enrolments, creating a one-to-many relationship between courses and enrolments.

Students and courses therefore have a many-to-many relationship: each student can take several courses, and each course can have several students. The `enrolments` table resolves this relationship by linking students to courses. The grade belongs in this table because it relates to a student's enrolment in a particular course.

## 3. Index

The index `idx_enrolments_course_id` is created on `enrolments(course_id)`. It helps SQLite find enrolments for a particular course more efficiently, especially when listing students taking a course or counting enrolments. An index can improve searches but requires additional storage and can add overhead to data changes.

## 4. SQL versus NoSQL

SQL databases are well suited to this school system because the data has clear relationships and requires primary keys, foreign keys, unique constraints and joins. SQL also supports transactions to help maintain data consistency. NoSQL databases can be useful for flexible or rapidly changing data structures and particular scaling needs, but a relational SQL database is a natural fit for this structured school-enrolment system.
