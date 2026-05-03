// Dashboard group layout — renders children WITHOUT the global Navigation bar
// (dashboards have their own built-in sidebar navigation)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
