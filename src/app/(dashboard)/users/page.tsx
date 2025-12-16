import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage team members and access</CardDescription>
        </CardHeader>
        <CardContent>
          <p>User management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}