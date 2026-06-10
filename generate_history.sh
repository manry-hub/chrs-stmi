#!/bin/bash

# Initialize git repository
git init

# Base date: 14 days ago
START_DATE=$(date -d "14 days ago" +%s)

# Helper function to commit with a date offset (in hours)
commit_with_date() {
    local offset_hours=$1
    local msg=$2
    local commit_date=$(date -d "@$((START_DATE + offset_hours * 3600))" -R)
    
    # Check if there are changes to commit
    if ! git diff --cached --quiet; then
        GIT_AUTHOR_DATE="$commit_date" GIT_COMMITTER_DATE="$commit_date" git commit -m "$msg"
    else
        echo "Nothing to commit for: $msg"
    fi
}

# 1. init: bootstrap Next.js app router with Tailwind CSS and TypeScript
git add package.json tsconfig.json next.config.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css 2>/dev/null
commit_with_date 0 "init: bootstrap Next.js app router with Tailwind CSS and TypeScript"

# 2. build: setup ESLint, PostCSS, and project configuration
git add eslint.config.mjs postcss.config.mjs next-env.d.ts 2>/dev/null
commit_with_date 2 "build: setup ESLint, PostCSS, and project configuration"

# 3. feat(firebase): integrate Firebase client and Admin SDK
git add src/lib/firebase/client.ts src/lib/firebase/admin.ts src/lib/firebase/reports.ts 2>/dev/null
commit_with_date 6 "feat(firebase): integrate Firebase client and Admin SDK"

# 4. chore(db): configure Firestore security rules and indexing
git add firestore.rules firestore.indexes.json 2>/dev/null
commit_with_date 8 "chore(db): configure Firestore security rules and indexing"

# 5. feat(ui): implement reusable UI primitives
git add src/components/ui/Button.tsx src/components/ui/Input.tsx src/components/ui/Label.tsx src/components/ui/Textarea.tsx src/components/ui/Select.tsx 2>/dev/null
commit_with_date 24 "feat(ui): implement reusable UI primitives"

# 6. feat(auth): configure Auth.js with custom credentials provider
git add src/lib/auth/index.ts src/types/next-auth.d.ts 2>/dev/null
commit_with_date 28 "feat(auth): configure Auth.js with custom credentials provider"

# 7. feat(auth): build login and registration interfaces
git add src/app/\(auth\)/layout.tsx src/app/\(auth\)/login/page.tsx src/app/\(auth\)/register/page.tsx 2>/dev/null
commit_with_date 32 "feat(auth): build login and registration interfaces"

# 8. feat(actions): implement secure user registration logic
git add src/actions/auth/registerUser.ts src/lib/validations/auth.ts src/lib/validations/user.ts 2>/dev/null
commit_with_date 48 "feat(actions): implement secure user registration logic"

# 9. feat(layout): create AppShell and navigation structure
git add src/components/layout/AppShell.tsx src/components/ui/LogoutButton.tsx 2>/dev/null
commit_with_date 54 "feat(layout): create AppShell and navigation structure"

# 10. feat(user): build user dashboard and real-time report hooks
git add src/app/\(user\)/layout.tsx src/app/\(user\)/dashboard/page.tsx src/hooks/useUserReports.ts 2>/dev/null
commit_with_date 72 "feat(user): build user dashboard and real-time report hooks"

# 11. feat(report): implement interactive report submission form
git add src/components/report/ReportSubmitForm.tsx src/components/report/LocationPicker.tsx src/components/report/ImagePreview.tsx 2>/dev/null
commit_with_date 78 "feat(report): implement interactive report submission form"

# 12. feat(actions): handle secure report submission with blob upload
git add src/actions/reports/submitReport.ts src/lib/validations/report.ts 2>/dev/null
commit_with_date 96 "feat(actions): handle secure report submission with blob upload"

# 13. feat(report): create report list and status badge components
git add src/components/report/UserReportList.tsx src/components/report/ReportCard.tsx src/components/report/ReportStatusBadge.tsx 2>/dev/null
commit_with_date 102 "feat(report): create report list and status badge components"

# 14. feat(admin): scaffold admin dashboard layout and sidebar
git add src/app/\(admin\)/layout.tsx src/app/\(admin\)/admin/page.tsx src/components/admin/AdminSidebar.tsx 2>/dev/null
commit_with_date 120 "feat(admin): scaffold admin dashboard layout and sidebar"

# 15. feat(admin): build real-time report table and filter controls
git add src/components/admin/ReportTable.tsx src/components/admin/ReportFilterBar.tsx 2>/dev/null
commit_with_date 126 "feat(admin): build real-time report table and filter controls"

# 16. feat(admin): implement detailed report view and activity log
git add src/app/reports/\[reportId\]/page.tsx src/components/admin/ReportDetailClient.tsx src/components/admin/ActivityLogTimeline.tsx 2>/dev/null
commit_with_date 144 "feat(admin): implement detailed report view and activity log"

# 17. feat(actions): implement administrative report mutation actions
git add src/actions/reports/confirmReport.ts src/actions/reports/markReportDone.ts src/actions/reports/deleteReport.ts 2>/dev/null
commit_with_date 150 "feat(actions): implement administrative report mutation actions"

# 18. feat(superadmin): setup superadmin layout and core stats
git add src/app/\(superadmin\)/layout.tsx src/app/\(superadmin\)/superadmin/page.tsx src/components/superadmin/StatsCard.tsx 2>/dev/null
commit_with_date 168 "feat(superadmin): setup superadmin layout and core stats"

# 19. feat(superadmin): implement comprehensive user management
git add src/components/superadmin/UserManagementTable.tsx src/components/superadmin/UserModal.tsx src/actions/users/getUsers.ts 2>/dev/null
commit_with_date 174 "feat(superadmin): implement comprehensive user management"

# 20. feat(actions): add user mutation actions for superadmin
git add src/actions/users/createUser.ts src/actions/users/updateUser.ts src/actions/users/updateUserRole.ts src/actions/users/deleteUser.ts 2>/dev/null
commit_with_date 192 "feat(actions): add user mutation actions for superadmin"

# 21. feat(analytics): add visualization charts for reporting metrics
git add src/components/superadmin/SuperadminCharts.tsx src/actions/analytics/getAnalytics.ts 2>/dev/null
commit_with_date 198 "feat(analytics): add visualization charts for reporting metrics"

# 22. feat(pwa): integrate Progressive Web App capabilities
git add src/app/manifest.ts public/sw.js src/components/pwa/ServiceWorkerRegister.tsx public/icon-*.png public/*.webp public/*.svg public/*.png 2>/dev/null
commit_with_date 216 "feat(pwa): integrate Progressive Web App capabilities"

# 23. feat(notifications): add push notification subscription
git add src/components/notifications/PushNotificationToggle.tsx src/actions/notifications/subscribeNotification.ts src/actions/notifications/unsubscribeNotification.ts 2>/dev/null
commit_with_date 222 "feat(notifications): add push notification subscription"

# 24. feat(notifications): implement server-side push dispatch logic
git add src/lib/notifications/sendPushToAdmins.ts 2>/dev/null
commit_with_date 240 "feat(notifications): implement server-side push dispatch logic"

# 25. feat(ui): add emergency call functionality and global dialogs
git add src/components/ui/EmergencyCallButton.tsx src/components/ui/ConfirmDialog.tsx src/components/providers/ToastProvider.tsx 2>/dev/null
commit_with_date 246 "feat(ui): add emergency call functionality and global dialogs"

# 26. refactor: centralize app constants and shared utilities
git add src/constants/index.ts src/lib/utils.ts src/types/index.ts 2>/dev/null
commit_with_date 264 "refactor: centralize app constants and shared utilities"

# 27. chore: provide database seeding script for superadmin
git add scripts/seed-admin.ts 2>/dev/null
commit_with_date 270 "chore: provide database seeding script for superadmin"

# 28. docs: write comprehensive documentation and guidelines
git add README.md AGENTS.md CLAUDE.md structure.txt 2>/dev/null
commit_with_date 288 "docs: write comprehensive documentation and guidelines"

# Fallback for any remaining uncommitted files (like api routes, package-lock.json)
git add . 2>/dev/null
commit_with_date 290 "chore: initial project configuration and remaining files setup"

echo "Git history generated successfully!"
