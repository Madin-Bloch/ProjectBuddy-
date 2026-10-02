# ProjectBuddy v1 Design

Date: 2026-09-30
Status: approved for implementation

## Problem

Indian BCA, MCA, BTech, and Diploma students must submit a project report, diagrams, PPT, and viva Q&A. Generic chat tools invent modules that are not in the code. ProjectBuddy reads the actual project files and builds a college-ready pack.

## Product

Name: ProjectBuddy
Language: English only
Primary input: project zip
Secondary input: public GitHub URL
Price: Rs 249 per project (UPI). Preview environment unlocks download without a live payment gateway.

## v1 user flow

1. Landing — zip first, GitHub optional, product video/demo, sample pages, price after the product is shown.
2. Scan — detect stack, tables, routes, modules. Stop if the project has almost no code.
3. Questions — student name, enrollment, college, course, title, problem, future work, guide name. Confirm detected modules.
4. Generate — 2-4 minutes. Preview watermarked pages.
5. Pay / unlock — then download zip.

## Download pack

- 01-project-report.docx and .pdf/.html
- 02-srs.md
- 03-diagrams (use case, ER, DFD 0/1, architecture, sequence, activity, deployment if found)
- 04-viva-qa.md
- 05-demo-script.md
- 06-presentation.pptx
- 07-learning-reflection.md
- 08-suggestions.md
- README.txt

Diagrams are produced only from detected tables, models, and routes. Missing facts are marked for the student to confirm.

## Runtime stack (this environment)

Laravel is the long-term fit for the founder, but this workspace has Node and no PHP/MySQL/Redis.

v1 implementation:

- Frontend: Vite + React
- Backend: Node.js Express
- Store: JSON files on disk
- Jobs: in-process async (same machine)
- Optional AI: USER_LLM_API_KEY + USER_LLM_BASE_URL (never platform keys)
- Fallback: deterministic generator grounded in the scan
- Payments: Razorpay-shaped UI, demo unlock in preview

## Non-goals for v1

Private GitHub OAuth, college template upload, Hindi copy, monthly plans, writing the student's application code.
