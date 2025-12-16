import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Kroeva</h1>
        <p className="text-muted-foreground">
          Automate your subscription management
        </p>
        <Link href="/insights">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}