Task 7 frontend integration

Copy these three files into:
C:\Users\lenovo\Task2\frontend\src\components\

Files:
- CompanyPortal.jsx (replace the existing file)
- PostsSection.jsx (new file)
- PostsSection.css (new file)

Do not replace CompanyPortal.css. The existing stylesheet is preserved and the new posts UI has its own stylesheet.

Then run in PowerShell:
cd C:\Users\lenovo\Task2\frontend
npm.cmd run build

The employee Home tab displays the company feed and post composer. The employee Posts tab displays the employee's own posts with edit/delete. The company admin Posts tab displays posts from that company and provides moderation delete.
